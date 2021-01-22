import { renderHook, cleanup, act } from '@testing-library/react-hooks';
import { useQueue, createImmutableQueue } from '../src';

interface Notification {
  message: string;
}

describe('useQueue', () => {
  afterEach(cleanup);

  it('should add and remove a queued item', () => {
    const { result } = renderHook(() =>
      useQueue<Notification>(createImmutableQueue())
    );
    expect(result.current.entries).toEqual([]);

    act(() => {
      result.current.add('test', { message: 'test' });
    });

    expect(result.current.entries.length).toEqual(1);
    expect(result.current.entries[0]).toEqual({
      id: 'test',
      data: { message: 'test' },
    });

    act(() => {
      result.current.remove('test');
    });

    expect(result.current.entries).toEqual([]);

    act(() => {
      result.current.add('test', { message: 'test' });
      result.current.add('test2', { message: 'test' });
    });

    expect(result.current.entries.length).toEqual(2);

    act(() => {
      result.current.add('test', { message: 'test2' });
    });

    // It should just update the existing notification
    expect(result.current.entries.length).toEqual(2);

    act(() => {
      result.current.removeAll();
    });

    expect(result.current.entries.length).toEqual(0);
  });

  it('should memoize add/remove/removeAll', () => {
    const { result } = renderHook(() =>
      useQueue<Notification>(createImmutableQueue())
    );

    const { add, remove, removeAll } = result.current;

    act(() => {
      result.current.add('test', { message: 'test' });
    });

    expect(result.current.add).toBe(add);
    expect(result.current.remove).toBe(remove);
    expect(result.current.removeAll).toBe(removeAll);

    act(() => {
      result.current.remove('test');
    });

    expect(result.current.add).toBe(add);
    expect(result.current.remove).toBe(remove);
    expect(result.current.removeAll).toBe(removeAll);
  });

  it('should call the onRemove callback when removing a notification', () => {
    const onRemoveCalls: string[] = [];

    const reset = () => {
      onRemoveCalls.splice(0, onRemoveCalls.length);
    };

    const onRemove = (id: string) => () => {
      onRemoveCalls.push(id);
    };

    {
      const { result } = renderHook(() =>
        useQueue<Notification>(createImmutableQueue())
      );
      act(() => {
        result.current.add('test', { message: 'test' }, onRemove('test'));
      });

      expect(onRemoveCalls).toEqual([]);
      act(() => {
        result.current.remove('test');
      });

      expect(onRemoveCalls).toEqual(['test']);
    }

    reset();

    {
      const { result } = renderHook(() =>
        useQueue<Notification>(createImmutableQueue())
      );

      // Add multiple
      act(() => {
        result.current.add('test', { message: 'test' }, onRemove('test'));
        result.current.add('test2', { message: 'test' }, onRemove('test2'));
      });

      expect(onRemoveCalls).toEqual([]);

      act(() => {
        result.current.removeAll();
      });

      expect(onRemoveCalls).toEqual(['test', 'test2']);
    }
  });
});
