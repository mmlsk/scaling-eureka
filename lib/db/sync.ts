import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import type { RealtimePostgresChangesPayload } from '@supabase/realtime-js';
import {
  REALTIME_LISTEN_TYPES,
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT,
} from '@supabase/realtime-js';
import { db } from './indexeddb';
import type { SyncQueueEntry } from '@/types/database';
import { logger } from '@/lib/logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabase;
}

type SyncableTable =
  | 'habits'
  | 'habitEntries'
  | 'todos'
  | 'nootropicStack'
  | 'nootropicLog'
  | 'sleepLog'
  | 'calendarEvents'
  | 'notes'
  | 'moodEntries'
  | 'timerSessions'
  | 'eventStore'
  | 'rooms'
  | 'pins'
  | 'checklist_items';

const TABLE_MAP: Record<SyncableTable, string> = {
  habits: 'habits',
  habitEntries: 'habit_entries',
  todos: 'todos',
  nootropicStack: 'nootropics',
  nootropicLog: 'nootropic_log',
  sleepLog: 'sleep_entries',
  calendarEvents: 'calendar_events',
  notes: 'notes',
  moodEntries: 'mood_entries',
  timerSessions: 'timer_sessions',
  eventStore: 'event_store',
  rooms: 'rooms',
  pins: 'pins',
  checklist_items: 'checklist_items',
};

/**
 * Add a pending operation to the sync queue.
 */
export async function addToSyncQueue(
  table: SyncableTable,
  operation: SyncQueueEntry['operation'],
  recordId: string,
  data: Record<string, unknown>,
): Promise<void> {
  await db.syncQueue.add({
    table,
    operation,
    record_id: recordId,
    data,
    synced: false,
    created_at: new Date().toISOString(),
  });
}

/**
 * Flush all unsynced entries from the sync queue to Supabase.
 * Processes entries in FIFO order and marks them as synced on success.
 */
export async function flushSyncQueue(): Promise<{ synced: number; failed: number }> {
  const client = getSupabase();
  const pending = await db.syncQueue
    .where('synced')
    .equals(0)
    .sortBy('created_at');

  let synced = 0;
  let failed = 0;

  for (const entry of pending) {
    const remoteTable = TABLE_MAP[entry.table as SyncableTable];
    if (!remoteTable) {
      failed++;
      continue;
    }

    try {
      let error: { message: string } | null = null;

      switch (entry.operation) {
        case 'insert': {
          const result = await client.from(remoteTable).insert(entry.data);
          error = result.error;
          break;
        }
        case 'update': {
          const result = await client
            .from(remoteTable)
            .update(entry.data)
            .eq('id', entry.record_id);
          error = result.error;
          break;
        }
        case 'delete': {
          const result = await client
            .from(remoteTable)
            .delete()
            .eq('id', entry.record_id);
          error = result.error;
          break;
        }
      }

      if (error) {
        logger.warn('Sync operation failed', { table: remoteTable, operation: entry.operation, error: error.message });
        failed++;
        continue;
      }

      if (entry.id !== undefined) {
        await db.syncQueue.update(entry.id, { synced: true });
      }
      synced++;
    } catch (err) {
      logger.error('Sync operation threw an exception', {
        table: remoteTable,
        operation: entry.operation,
        error: err instanceof Error ? err.message : String(err),
      });
      failed++;
    }
  }

  return { synced, failed };
}

/**
 * Handle a realtime change from Supabase and apply it to IndexedDB.
 */
export async function onRealtimeChange(payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  new: Record<string, unknown> | null;
  old: { id: string } | null;
}): Promise<void> {
  const localTableName = Object.entries(TABLE_MAP).find(
    ([, remote]) => remote === payload.table,
  )?.[0] as SyncableTable | undefined;

  if (!localTableName) return;

  const table = db.table(localTableName);

  switch (payload.eventType) {
    case 'INSERT':
    case 'UPDATE': {
      if (payload.new && typeof payload.new === 'object' && 'id' in payload.new && payload.new.id) {
        await table.put(payload.new);
      }
      break;
    }
    case 'DELETE': {
      if (payload.old?.id) {
        await table.delete(payload.old.id);
      }
      break;
    }
  }
}

/**
 * Subscribe to realtime changes on a Supabase table.
 * Returns the channel for cleanup.
 */
export function subscribeToTable(
  remoteTable: string,
  callback?: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    table: string;
    new: Record<string, unknown> | null;
    old: { id: string } | null;
  }) => void,
): RealtimeChannel {
  const client = getSupabase();

  type Row = { [key: string]: string };

  const handlePayload = (
    payload: RealtimePostgresChangesPayload<Row>,
  ): void => {
    const normalized = {
      eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
      table: remoteTable,
      new:
        'new' in payload && payload.new
          ? (payload.new as Record<string, unknown>)
          : null,
      old:
        'old' in payload && payload.old
          ? (payload.old as { id: string })
          : null,
    };

    void onRealtimeChange(normalized);
    callback?.(normalized);
  };

  const channel = client
    .channel(`realtime:${remoteTable}`)
    .on(
      REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
      {
        event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.ALL,
        schema: 'public',
        table: remoteTable,
      },
      handlePayload,
    )
    .subscribe();

  return channel;
}
