'use client';

import { useState, useCallback, useRef } from 'react';

interface UsePaginationOptions<T> {
  fetchFn: (params: { cursor: string | null; pageSize: number }) => Promise<{
    data: T[];
    cursor: string | null;
    hasMore: boolean;
  }>;
  pageSize?: number;
}

interface UsePaginationReturn<T> {
  data: T[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  cursor: string | null;
  reset: () => void;
}

/**
 * Cursor-based pagination hook.
 *
 * The `fetchFn` receives `{ cursor, pageSize }` and must return
 * `{ data, cursor, hasMore }`. Each call to `loadMore()` appends
 * the new page to the existing data.
 *
 * @example
 * ```tsx
 * const { data, loading, hasMore, loadMore } = usePagination<Todo>({
 *   fetchFn: async ({ cursor, pageSize }) => {
 *     const res = await fetch(`/api/todos?cursor=${cursor ?? ''}&limit=${pageSize}`);
 *     return res.json();
 *   },
 *   pageSize: 20,
 * });
 * ```
 */
export function usePagination<T>({
  fetchFn,
  pageSize = 20,
}: UsePaginationOptions<T>): UsePaginationReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef<string | null>(null);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const result = await fetchFn({
        cursor: cursorRef.current,
        pageSize,
      });

      setData((prev) => [...prev, ...result.data]);
      cursorRef.current = result.cursor;
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('[usePagination] Failed to fetch page:', err);
      setHasMore(false);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [fetchFn, pageSize, hasMore]);

  const reset = useCallback(() => {
    setData([]);
    setLoading(false);
    setHasMore(true);
    cursorRef.current = null;
    loadingRef.current = false;
  }, []);

  return {
    data,
    loading,
    hasMore,
    loadMore,
    cursor: cursorRef.current,
    reset,
  };
}
