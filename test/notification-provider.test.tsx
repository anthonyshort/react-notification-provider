import React from 'react';
import { render, cleanup, act, fireEvent } from '@testing-library/react';
import MutationObserver from '@sheerun/mutationobserver-shim';
import { createNotificationContext } from '../src';

window.MutationObserver = MutationObserver;

interface Notification {
  message: string;
}

const {
  useNotificationQueue,
  NotificationProvider,
  createMockNotificationQueue,
} = createNotificationContext<Notification>();

function TestComponent() {
  const notifications = useNotificationQueue();

  function add() {
    notifications.add('test', {
      message: 'test',
    });
  }

  function addDynamic() {
    notifications.add(Date.now().toString(), {
      message: 'test',
    });
  }

  function remove() {
    notifications.remove('test');
  }

  function removeAll() {
    notifications.removeAll();
  }

  return (
    <div>
      <button onClick={add}>Add</button>
      <button onClick={addDynamic}>Add other</button>
      <button onClick={remove}>Remove</button>
      <button onClick={removeAll}>Remove all</button>
    </div>
  );
}

function NotificationList() {
  const notifications = useNotificationQueue();

  return (
    <div data-testid="notifications">
      {notifications.entries.map(notification => (
        <div key={notification.id}>{notification.data.message}</div>
      ))}
    </div>
  );
}

describe('NotificationProvider', () => {
  afterEach(cleanup);

  it('should add and remove a notification', async () => {
    const { findByText, findByTestId } = render(
      <NotificationProvider>
        <TestComponent />
        <NotificationList />
      </NotificationProvider>
    );

    const addButton = await findByText('Add');
    const addOtherButton = await findByText('Add other');
    const removeButton = await findByText('Remove');
    const removeAllButton = await findByText('Remove all');
    const notificationList = await findByTestId('notifications');

    act(() => {
      fireEvent.click(addButton);
    });

    expect(notificationList.children.length).toEqual(1);
    expect(notificationList.children[0].innerHTML).toEqual('test');

    act(() => {
      fireEvent.click(removeButton);
    });

    expect(notificationList.children.length).toEqual(0);

    act(() => {
      fireEvent.click(addButton);
      fireEvent.click(addOtherButton);
    });

    expect(notificationList.children.length).toEqual(2);

    act(() => {
      fireEvent.click(addButton);
    });

    // It should just update the existing notification
    expect(notificationList.children.length).toEqual(2);

    act(() => {
      fireEvent.click(removeAllButton);
    });

    expect(notificationList.children.length).toEqual(0);
  });

  it('should allow mocking a custom queue', async () => {
    const queue = createMockNotificationQueue();
    const addNotification = jest.spyOn(queue, 'add');
    const removeNotification = jest.spyOn(queue, 'remove');
    const removeAllNotifications = jest.spyOn(queue, 'removeAll');

    const { findByText } = render(
      <NotificationProvider queue={queue}>
        <TestComponent />
      </NotificationProvider>
    );

    const addButton = await findByText('Add');
    const removeButton = await findByText('Remove');
    const removeAllButton = await findByText('Remove all');

    act(() => {
      fireEvent.click(addButton);
    });

    expect(addNotification).toHaveBeenCalledWith('test', {
      message: 'test',
    });

    act(() => {
      fireEvent.click(removeButton);
    });

    expect(removeNotification).toHaveBeenCalledWith('test');

    act(() => {
      fireEvent.click(removeAllButton);
    });

    expect(removeAllNotifications).toHaveBeenCalled();
  });

  it('should allow passing in a mock notification queue', async () => {
    const queue = createMockNotificationQueue();

    const { findByText } = render(
      <NotificationProvider queue={queue}>
        <TestComponent />
      </NotificationProvider>
    );

    const addButton = await findByText('Add');
    const addOtherButton = await findByText('Add other');
    const removeButton = await findByText('Remove');
    const removeAllButton = await findByText('Remove all');

    act(() => {
      fireEvent.click(addButton);
    });

    expect(queue.entries.length).toEqual(1);
    expect(queue.entries).toEqual([
      {
        id: 'test',
        data: {
          message: 'test',
        },
      },
    ]);

    act(() => {
      fireEvent.click(removeButton);
    });

    expect(queue.entries.length).toEqual(0);

    act(() => {
      fireEvent.click(addButton);
      fireEvent.click(addOtherButton);
    });

    expect(queue.entries.length).toEqual(2);

    act(() => {
      fireEvent.click(addButton);
    });

    // It should just update the existing notification
    expect(queue.entries.length).toEqual(2);

    act(() => {
      fireEvent.click(removeAllButton);
    });

    expect(queue.entries.length).toEqual(0);
  });
});
