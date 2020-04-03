import React from 'react';
import { render, cleanup, act, fireEvent } from '@testing-library/react';
import MutationObserver from '@sheerun/mutationobserver-shim';
import { createNotificationContext } from '../src';

window.MutationObserver = MutationObserver;

interface Notification {
  message: string;
}

const {
  MockNotificationQueueProvider,
  useNotifications,
  createMockNotificationQueue,
} = createNotificationContext<Notification>();

function TestComponent() {
  const notifications = useNotifications();

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

describe('MockNotificationQueueProvider', () => {
  afterEach(cleanup);

  it('should add and remove a notification', async () => {
    const queue = createMockNotificationQueue();

    const { findByText } = render(
      <MockNotificationQueueProvider queue={queue}>
        <TestComponent />
      </MockNotificationQueueProvider>
    );

    const addButton = await findByText('Add');
    const addOtherButton = await findByText('Add other');
    const removeButton = await findByText('Remove');
    const removeAllButton = await findByText('Remove all');

    act(() => {
      fireEvent.click(addButton);
    });

    expect(queue.list.length).toEqual(1);
    expect(queue.list[0]).toEqual({
      id: 'test',
      data: { message: 'test' },
    });

    act(() => {
      fireEvent.click(removeButton);
    });

    expect(queue.list).toEqual([]);

    act(() => {
      fireEvent.click(addButton);
      fireEvent.click(addOtherButton);
    });

    expect(queue.list.length).toEqual(2);

    act(() => {
      fireEvent.click(addButton);
    });

    // It should just update the existing notification
    expect(queue.list.length).toEqual(2);

    act(() => {
      fireEvent.click(removeAllButton);
    });

    expect(queue.list.length).toEqual(0);
  });

  it('should still work with no queue passed in', async () => {
    const { findByText } = render(
      <MockNotificationQueueProvider>
        <TestComponent />
      </MockNotificationQueueProvider>
    );

    const addButton = await findByText('Add');

    act(() => {
      fireEvent.click(addButton);
    });
  });
});
