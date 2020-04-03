import { createNotificationContext } from '../src';

interface Notification {
  message: string;
}

const { createMockNotificationQueue } = createNotificationContext<
  Notification
>();

describe('createMockNotificationQueue', () => {
  it('should add and remove a notification', () => {
    const queue = createMockNotificationQueue();

    expect(queue.list).toEqual([]);

    queue.add('test', { message: 'test' });

    expect(queue.list.length).toEqual(1);
    expect(queue.list[0]).toEqual({
      id: 'test',
      data: { message: 'test' },
    });

    queue.remove('test');

    expect(queue.list).toEqual([]);

    queue.add('test', { message: 'test' });
    queue.add('test2', { message: 'test' });

    expect(queue.list.length).toEqual(2);

    queue.add('test', { message: 'test2' });

    // It should just update the existing notification
    expect(queue.list.length).toEqual(2);

    queue.removeAll();

    expect(queue.list.length).toEqual(0);
  });
});
