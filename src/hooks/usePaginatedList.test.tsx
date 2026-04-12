import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { usePaginatedList } from './usePaginatedList';
import type { PaginatedResponse } from '@/types';

function makeFetcher(pages: number[][]) {
  return vi.fn(async (limit: number, offset: number): Promise<PaginatedResponse<number>> => {
    const page = Math.floor(offset / limit);
    const items = pages[page] ?? [];
    return { items, more: page + 1 < pages.length };
  });
}

describe('usePaginatedList', () => {
  it('loads the first page on mount', async () => {
    const fetcher = makeFetcher([[1, 2, 3]]);
    const { result } = renderHook(() => usePaginatedList(fetcher, { limit: 3 }));

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.items).toEqual([1, 2, 3]);
    expect(result.current.hasMore).toBe(false);
    expect(fetcher).toHaveBeenCalledWith(3, 0);
  });

  it('accumulates items across loadMore', async () => {
    const fetcher = makeFetcher([[1, 2], [3, 4], [5]]);
    const { result } = renderHook(() => usePaginatedList(fetcher, { limit: 2 }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.items).toEqual([1, 2]);
    expect(result.current.hasMore).toBe(true);

    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.items).toEqual([1, 2, 3, 4]);
    expect(result.current.hasMore).toBe(true);

    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.items).toEqual([1, 2, 3, 4, 5]);
    expect(result.current.hasMore).toBe(false);
  });

  it('captures errors and exposes retry via reload', async () => {
    let fail = true;
    const fetcher = vi.fn(async (): Promise<PaginatedResponse<number>> => {
      if (fail) throw new Error('network down');
      return { items: [10, 20], more: false };
    });
    const { result } = renderHook(() => usePaginatedList(fetcher, { limit: 20 }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.items).toEqual([]);

    fail = false;
    await act(async () => {
      await result.current.reload();
    });
    expect(result.current.error).toBeNull();
    expect(result.current.items).toEqual([10, 20]);
  });

  it('resets when deps change', async () => {
    let category = 'a';
    const fetcher = vi.fn(
      async (): Promise<PaginatedResponse<string>> => ({
        items: [category],
        more: false,
      }),
    );

    const { result, rerender } = renderHook(
      ({ cat }) => {
        category = cat;
        return usePaginatedList(fetcher, { limit: 20, deps: [cat] });
      },
      { initialProps: { cat: 'a' } },
    );

    await waitFor(() => expect(result.current.items).toEqual(['a']));

    rerender({ cat: 'b' });
    await waitFor(() => expect(result.current.items).toEqual(['b']));
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
