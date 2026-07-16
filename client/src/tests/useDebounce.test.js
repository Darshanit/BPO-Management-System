import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useDebounce from '../hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('does not update the debounced value before the delay elapses', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'a' },
    });

    rerender({ value: 'b' });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe('a');
  });

  it('updates the debounced value after the delay elapses', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'a' },
    });

    rerender({ value: 'b' });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('b');
  });

  it('resets the timer on rapid successive changes (only the latest value wins)', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'a' },
    });

    rerender({ value: 'b' });
    act(() => {
      vi.advanceTimersByTime(150);
    });
    rerender({ value: 'c' });
    act(() => {
      vi.advanceTimersByTime(150);
    });
    // Only 150ms have passed since the last change ('c'), so it shouldn't have committed yet
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current).toBe('c');
  });
});
