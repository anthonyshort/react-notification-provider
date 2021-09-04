import React, {
  useCallback,
  useMemo,
  useState,
  createContext,
  useContext,
} from 'react';

/**
 * Represents a queued item. The ID is used internally to reference every notification. The generic types is intended
 * to be used by the end user so they can have a custom notification shape.
 */
export type QueuedItem<Data> = {
  id: string;
  data: Data;
};

/**
 * This is the returned result from the hook
 */
export interface ImmutableQueue<T> {
  add: (id: string, data: T) => ImmutableQueue<T>;
  remove: (id: string) => ImmutableQueue<T>;
  removeAll: () => ImmutableQueue<T>;
  entries: QueuedItem<T>[];
}

export interface ProviderProps<Notification> {
  queue?: ImmutableQueue<Notification>;
  children: React.ReactNode;
}

export interface QueueHook<T> {
  add: (id: string, data: T) => void;
  remove: (id: string) => void;
  removeAll: () => void;
  entries: QueuedItem<T>[];
}

/**
 * This hook lets you create a notification queue that can be manipulated. It accepts a notification type that describes
 * the shape of every notification that is allowed to be emitted. This doesn't provide any UI for the notifications.
 * This is left up to the end user to implement.
 *
 * This means you'll need to create your own NotificationProvider to create the queue, render the notifications, and
 * provide the queue API to your components so they can add notifications.
 *
 *      interface Data {
 *        message: string;
 *      }
 *
 *      function MyNotificationProvider() {
 *        const queue = useQueue<Data>();
 *
 *        return (
 *          queue.list.map(item => {
 *            return <div>{item.message}</div>
 *          })
 *        )
 *      }
 */
export function useQueue<T>(initialValue: ImmutableQueue<T>): QueueHook<T> {
  const [{ entries }, setQueue] = useState(initialValue);

  /**
   * Add a new notification to the queue. If the ID already exists it will updated.
   * @param id Unique string identifier for notification.
   * @param data
   */
  const add = useCallback(
    (id: string, data: T): void => {
      setQueue(queue => queue.add(id, data));
    },
    [setQueue]
  );

  /**
   * Remove a notification by ID
   * @param id Unique string identifier for a notification
   */
  const remove = useCallback(
    (id: string): void => {
      setQueue(queue => queue.remove(id));
    },
    [setQueue]
  );

  /**
   * Remove all notifications from the page.
   */
  const removeAll = useCallback((): void => {
    setQueue(queue => queue.removeAll());
  }, [setQueue]);

  return useMemo(
    () => ({
      add,
      remove,
      removeAll,
      entries,
    }),
    [add, remove, removeAll, entries]
  );
}

/**
 * Create an immutable queue. Adding and removing items will return a new queue.
 */
export function createImmutableQueue<T>(
  entries: QueuedItem<T>[] = []
): ImmutableQueue<T> {
  return {
    add(id: string, data: T): ImmutableQueue<T> {
      const matchIndex = entries.findIndex(n => {
        return n.id === id;
      });
      const copy = entries.slice();
      if (matchIndex > -1) {
        copy.splice(matchIndex, 1, {
          id,
          data,
        });
      } else {
        copy.push({
          id,
          data,
        });
      }
      return createImmutableQueue(copy);
    },
    remove(id: string): ImmutableQueue<T> {
      return createImmutableQueue(entries.filter(n => n.id !== id));
    },
    removeAll(): ImmutableQueue<T> {
      return createImmutableQueue();
    },
    entries,
  };
}

/**
 * Create a mutable queue. Adding and removing items will return the same queue.
 */
export function createMockImmutableQueue<T>(
  initialValue: QueuedItem<T>[] = []
): ImmutableQueue<T> {
  const entries = initialValue;
  const updateEntries = (queue: ImmutableQueue<T>) => {
    entries.splice(0, entries.length);
    entries.push(...queue.entries);
  };

  return {
    add(id: string, data: T): ImmutableQueue<T> {
      const queue = createImmutableQueue(entries).add(id, data);
      updateEntries(queue);
      return this;
    },
    remove(id: string): ImmutableQueue<T> {
      const queue = createImmutableQueue(entries).remove(id);
      updateEntries(queue);
      return this;
    },
    removeAll(): ImmutableQueue<T> {
      const queue = createImmutableQueue(entries).removeAll();
      updateEntries(queue);
      return this;
    },
    entries,
  };
}

/**
 * Create a React context and hook for accessing it typed to your notification shape.
 *
 *      const { NotificationQueueProvider, useNotifications } = createNotificationContext<Notification>();
 *
 * This allows you to skip some of the ceremony needed to setup your own notification renderer.
 */
export function createNotificationContext<Notification>() {
  const NotificationQueueContext = createContext<QueueHook<
    Notification
  > | null>(null);

  /**
   * This hook allows you to add and remove notifications from within your components.
   */
  function useNotificationQueue(): QueueHook<Notification> {
    const queue = useContext(NotificationQueueContext);
    if (!queue) {
      throw new Error('Missing <NotificationProvider>');
    }
    return queue;
  }

  /**
   * This component should wrap your app. It allows components to use the useNotifications hook.
   * @param props
   */
  function NotificationProvider(
    props: ProviderProps<Notification>
  ): JSX.Element {
    const { children, queue: initialQueue } = props;
    const queue = useQueue<Notification>(
      initialQueue ? initialQueue : createImmutableQueue()
    );
    return (
      <NotificationQueueContext.Provider value={queue}>
        {children}
      </NotificationQueueContext.Provider>
    );
  }

  /**
   * Create a fake notification queue that can be used during tests and stories. Unlike the normal queue this one isn't
   * immutable, so you'll be able to inspect the state of the queue between renders:
   *
   *      const queue = createMockNotificationQueue();
   *
   *      const { findByText } = render(
   *        <MockNotificationQueueProvider queue={queue}>
   *          <MyComponent />
   *        </MockNotificationQueueProvider>
   *      );
   *
   *      const el = await findByText('Submit');
   *
   *      act(() => {
   *        fireEvent.click(el);
   *      })
   *
   *      expect(queue.list.length).toBe(1);
   *      expect(queue.list[0]).toEqual({ id: 'submitting', data: { message: 'Submitting...' } });
   *
   * This will let you test that notifications are correctly firing without needing to look for elements in the DOM.
   */
  function createNotificationQueue() {
    return createImmutableQueue<Notification>();
  }

  function createMockNotificationQueue() {
    return createMockImmutableQueue<Notification>();
  }

  return {
    NotificationQueueContext,
    NotificationProvider,
    useNotificationQueue,
    createNotificationQueue,
    createMockNotificationQueue,
  };
}
