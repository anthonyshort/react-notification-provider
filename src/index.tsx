import React, { useState, createContext, useContext } from 'react';

/**
 * Represents a queued item. The ID is used internally to reference every notification. The generic types is intended
 * to be used by the end user so they can have a custom notification shape.
 */
export type Queued<Notification> = {
  id: string;
  data: Notification;
};

/**
 * This is the returned result from the hook
 */
export interface Queue<Notification> {
  add: (id: string, notification: Notification) => void;
  remove: (id: string) => void;
  removeAll: () => void;
  list: Queued<Notification>[];
}

/**
 * This hook lets you create a notification queue that can be manipulated. It accepts a notification type that describes
 * the shape of every notification that is allowed to be emitted. This doesn't provide any UI for the notifications.
 * This is left up to the end user to implement.
 *
 * This means you'll need to create your own NotificationProvider to create the queue, render the notifications, and
 * provide the queue API to your components so they can add notifications.
 *
 *      interface CustomNotification {
 *        message: string;
 *      }
 *
 *      function MyNotificationProvider() {
 *        const queue = useNotificationQueue<CustomNotification>();
 *
 *        return (
 *          queue.list.map(item => {
 *            return <div>{item.message}</div>
 *          })
 *        )
 *      }
 */
export function useNotificationQueue<Notification>(): Queue<Notification> {
  const [queue, setQueue] = useState<Queued<Notification>[]>([]);

  return {
    /**
     * Add a new notification to the queue. If the ID already exists it will updated.
     * @param id Unique string identifier for notification.
     * @param notification
     */
    add(id: string, notification: Notification): void {
      setQueue(queue => {
        const matchIndex = queue.findIndex(n => {
          return n.id === id;
        });
        const copy = queue.slice();
        if (matchIndex > -1) {
          copy.splice(matchIndex, 1, {
            id,
            data: notification,
          });
        } else {
          copy.push({
            id,
            data: notification,
          });
        }
        return copy;
      });
    },

    /**
     * Remove a notification by ID
     * @param id Unique string identifier for a notification
     */
    remove(id: string): void {
      setQueue(queue => queue.filter(n => n.id !== id));
    },

    /**
     * Remove all notifications from the page.
     */
    removeAll(): void {
      setQueue([]);
    },

    /**
     * The current array of notifications.
     */
    list: queue,
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
  const NotificationQueueContext = createContext<Queue<Notification> | null>(
    null
  );

  function useNotifications(): Queue<Notification> {
    const queue = useContext(NotificationQueueContext);
    if (!queue) {
      throw new Error('Missing NotificationsProvider');
    }
    return queue;
  }

  function NotificationQueueProvider(props: {
    queue: Queue<Notification>;
    children: React.ReactNode;
  }): JSX.Element {
    const { queue, children } = props;
    return (
      <NotificationQueueContext.Provider value={queue}>
        {children}
      </NotificationQueueContext.Provider>
    );
  }

  return {
    NotificationQueueContext,
    NotificationQueueProvider,
    useNotifications,
  };
}
