import { renderHook, cleanup, act } from '@testing-library/react-hooks';
import { createNotificationContext } from '../src';

interface Notification {
  message: string;
}

const { useNotificationQueue } = createNotificationContext<Notification>();

describe('useNotificationQueue', () => {
  afterEach(cleanup);

  it('should add and remove a notification', () => {
    const { result } = renderHook(() => useNotificationQueue());
    expect(result.current.list).toEqual([]);

    act(() => {
      result.current.add('test', { message: 'test' });
    });

    expect(result.current.list.length).toEqual(1);
    expect(result.current.list[0]).toEqual({
      id: 'test',
      data: { message: 'test' },
    });

    act(() => {
      result.current.remove('test');
    });

    expect(result.current.list).toEqual([]);

    act(() => {
      result.current.add('test', { message: 'test' });
      result.current.add('test2', { message: 'test' });
    });

    expect(result.current.list.length).toEqual(2);

    act(() => {
      result.current.add('test', { message: 'test2' });
    });

    // It should just update the existing notification
    expect(result.current.list.length).toEqual(2);

    act(() => {
      result.current.removeAll();
    });

    expect(result.current.list.length).toEqual(0);
  });
});
