import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAsync } from './useAsync';

describe('useAsync', () => {
  it('starts in loading state and resolves with data', async () => {
    const fn = vi.fn(async () => 'hello');
    const { result } = renderHook(() => useAsync(fn));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBe('hello');
    expect(result.current.error).toBeNull();
  });

  it('captures errors', async () => {
    const fn = vi.fn(async () => {
      throw new Error('kaboom');
    });
    const { result } = renderHook(() => useAsync(fn));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('kaboom');
    expect(result.current.data).toBeNull();
  });

  it('reloads on demand', async () => {
    let counter = 0;
    const fn = vi.fn(async () => {
      counter += 1;
      return counter;
    });
    const { result } = renderHook(() => useAsync(fn));

    await waitFor(() => expect(result.current.data).toBe(1));
    await act(async () => {
      await result.current.reload();
    });
    expect(result.current.data).toBe(2);
  });
});
