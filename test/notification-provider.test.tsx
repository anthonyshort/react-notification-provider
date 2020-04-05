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
});
