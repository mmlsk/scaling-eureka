'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '@/lib/db/indexeddb';
import type { IndexableType } from 'dexie';

interface UseIndexedDBReturn<T> {
  data: T[];
  loading: boolean;
  add: (item: T) => Promise<void>;
  update: (id: IndexableType, changes: Partial<T>) => Promise<void>;
  remove: (id: IndexableType) => Promise<void>;
}

/**
 * Generic hook for CRUD operations on a Dexie table.
 *
 * @param tableName - The name of the table in LifeOSDB.
 * @returns An object with reactive `data`, `loading` state, and `add`, `update`, `remove` functions.
 *
 * @example
 * ```tsx
 * const { data: habits, loading, add, remove } = useIndexedDB<Habit>('habits');
 * ```
 */
export function useIndexedDB<T extends Record<string, unknown>>(
  tableName: string,
): UseIndexedDBReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const table = db.table<T, IndexableType>(tableName);
      const items = await table.toArray();
      if (mountedRef.current) {
        setData(items);
      }
    } catch (err) {
      console.error(`[useIndexedDB] Failed to read table "${tableName}":`, err);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [tableName]);

  useEffect(() => {
    mountedRef.current = true;
    void refresh();

    return () => {
      mountedRef.current = false;
    };
  }, [refresh]);

  const add = useCallback(
    async (item: T) => {
      const table = db.table<T, IndexableType>(tableName);
      await table.add(item);
      await refresh();
    },
    [tableName, refresh],
  );

  const update = useCallback(
    async (id: IndexableType, changes: Partial<T>) => {
      const table = db.table(tableName);
      await table.update(id, changes);
      await refresh();
    },
    [tableName, refresh],
  );

  const remove = useCallback(
    async (id: IndexableType) => {
      const table = db.table<T, IndexableType>(tableName);
      await table.delete(id);
      await refresh();
    },
    [tableName, refresh],
  );

  return { data, loading, add, update, remove };
}
