import React, { useState, createContext, useContext } from 'react';

/**
 * Represents a queued item. The ID is used internally to reference every notification. The generic types is intended
 * to be used by the end user so they can have a custom notification shape.
 */
export type Queued<Data> = {
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
  entries: Queued<T>[];
}

interface MockProps<Notification> {
  queue?: ImmutableQueue<Notification>;
  children: React.ReactNode;
}

export interface QueueHook<T> {
  add: (id: string, data: T) => void;
  remove: (id: string) => void;
  removeAll: () => void;
  entries: Queued<T>[];
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
  const [queue, setQueue] = useState(initialValue);

  return {
    /**
     * Add a new notification to the queue. If the ID already exists it will updated.
     * @param id Unique string identifier for notification.
     * @param data
     */
    add(id: string, data: T): void {
      setQueue(queue => queue.add(id, data));
    },

    /**
     * Remove a notification by ID
     * @param id Unique string identifier for a notification
     */
    remove(id: string): void {
      setQueue(queue => queue.remove(id));
    },

    /**
     * Remove all notifications from the page.
     */
    removeAll(): void {
      setQueue(queue => queue.removeAll());
    },

    /**
     * The current array of notifications.
     */
    entries: queue.entries,
  };
}

/**
 * Create an immutable queue. Adding and removing items will return a new queue.
 */
export function createImmutableQueue<T>(
  items: Queued<T>[] = []
): ImmutableQueue<T> {
  return {
    add(id: string, data: T): ImmutableQueue<T> {
      const matchIndex = items.findIndex(n => {
        return n.id === id;
      });
      const copy = items.slice();
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
      return createImmutableQueue(items.filter(n => n.id !== id));
    },
    removeAll(): ImmutableQueue<T> {
      return createImmutableQueue();
    },
    entries: items,
  };
}

/**
 * Create a mutable queue. Adding and removing items will return the same queue.
 */
export function createMockImmutableQueue<T>(
  initialValue: Queued<T>[] = []
): ImmutableQueue<T> {
  const entries: Queued<T>[] = initialValue;

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
      entries.splice(0, entries.length);
      entries.push(...copy);
      return this;
    },
    remove(id: string): ImmutableQueue<T> {
      const copy = entries.filter(n => n.id !== id);
      entries.splice(0, entries.length);
      entries.push(...copy);
      return this;
    },
    removeAll(): ImmutableQueue<T> {
      entries.splice(0, entries.length);
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
  function NotificationProvider(props: {
    children: React.ReactNode;
  }): JSX.Element {
    const { children } = props;
    const queue = useQueue<Notification>(createImmutableQueue());
    return (
      <NotificationQueueContext.Provider value={queue}>
        {children}
      </NotificationQueueContext.Provider>
    );
  }

  /**
   * Create a mock provider to use in tests. You can optionally pass in a custom queue so you can inspect the
   * notifications that can be fired.
   *
   *      <MockNotificationQueueProvider>
   *        <Component />
   *      </MockNotificationQueueProvider>
   *
   * This is useful for tests and stories.
   * @param props
   */
  function MockNotificationProvider(
    props: MockProps<Notification>
  ): JSX.Element {
    const { queue, children } = props;
    const [value] = useState(
      queue ? queue : createImmutableQueue<Notification>()
    );
    return (
      <NotificationQueueContext.Provider value={value}>
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
  function createMockNotificationQueue() {
    return createMockImmutableQueue<Notification>();
  }

  return {
    NotificationQueueContext,
    NotificationProvider,
    MockNotificationProvider,
    useNotificationQueue,
    createMockNotificationQueue,
  };
}
