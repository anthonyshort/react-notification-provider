import { createMockImmutableQueue } from '../src';

interface Notification {
  message: string;
}

describe('createMockImmutableQueue', () => {
  it('should add and remove a notification', () => {
    const queue = createMockImmutableQueue<Notification>();

    expect(queue.entries).toEqual([]);

    queue.add('test', { message: 'test' });

    expect(queue.entries.length).toEqual(1);
    expect(queue.entries[0]).toEqual({
      id: 'test',
      data: { message: 'test' },
    });

    queue.remove('test');

    expect(queue.entries).toEqual([]);

    queue.add('test', { message: 'test' });
    queue.add('test2', { message: 'test' });

    expect(queue.entries.length).toEqual(2);

    queue.add('test', { message: 'test2' });

    // It should just update the existing notification
    expect(queue.entries.length).toEqual(2);

    queue.removeAll();

    expect(queue.entries.length).toEqual(0);
  });
});
