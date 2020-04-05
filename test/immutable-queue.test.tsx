import { createImmutableQueue } from '../src';

interface Notification {
  message: string;
}

describe('createImmutableQueue', () => {
  it('should add and remove a notification', () => {
    const queue = createImmutableQueue<Notification>();

    expect(queue.entries).toEqual([]);

    const q2 = queue.add('test', { message: 'test' });
    expect(q2).not.toBe(queue);

    expect(q2.entries.length).toEqual(1);
    expect(q2.entries[0]).toEqual({
      id: 'test',
      data: { message: 'test' },
    });

    const q3 = q2.remove('test');

    expect(q3.entries).toEqual([]);
    expect(q3).not.toBe(q2);

    // Add multiple
    const q4 = q3
      .add('test', { message: 'test' })
      .add('test2', { message: 'test' });

    expect(q4.entries.length).toEqual(2);

    // It should just update the existing notification
    const q5 = q4.add('test', { message: 'test2' });

    expect(q5.entries.length).toEqual(2);

    const q6 = q5.removeAll();

    expect(q6.entries.length).toEqual(0);
  });
});
