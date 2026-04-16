'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient, type RealtimeChannel } from '@supabase/supabase-js';
import {
  REALTIME_LISTEN_TYPES,
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT,
  type RealtimePostgresChangesPayload,
} from '@supabase/realtime-js';

type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimePayload {
  eventType: RealtimeEventType;
  table: string;
  new: Record<string, unknown> | null;
  old: { id: string } | null;
}

type SubscriptionStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'closed';

interface UseRealtimeReturn {
  status: SubscriptionStatus;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * Subscribe to Supabase realtime changes on a specific table.
 * Cleans up the subscription on unmount.
 *
 * @param table - Supabase table name to subscribe to.
 * @param filter - Optional Postgres filter string (e.g. "user_id=eq.abc123").
 * @param callback - Called on each INSERT/UPDATE/DELETE event.
 *
 * @example
 * ```tsx
 * const { status } = useRealtime('habits', 'user_id=eq.abc', (payload) => {
 *   console.log('Change:', payload);
 * });
 * ```
 */
export function useRealtime(
  table: string,
  filter?: string,
  callback?: (payload: RealtimePayload) => void,
): UseRealtimeReturn {
  const [status, setStatus] = useState<SubscriptionStatus>('idle');
  const channelRef = useRef<RealtimeChannel | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref fresh without re-subscribing
  callbackRef.current = callback;

  useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setStatus('error');
      return;
    }

    setStatus('connecting');

    const client = createClient(supabaseUrl, supabaseAnonKey);
    const channelName = filter
      ? `realtime:${table}:${filter}`
      : `realtime:${table}`;

    type Row = { [key: string]: string };

    const pgFilter: {
      event: `${REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.ALL}`;
      schema: string;
      table: string;
      filter?: string;
    } = {
      event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.ALL,
      schema: 'public',
      table,
    };

    if (filter) {
      pgFilter.filter = filter;
    }

    const handlePayload = (
      payload: RealtimePostgresChangesPayload<Row>,
    ): void => {
      const normalized: RealtimePayload = {
        eventType: payload.eventType as RealtimeEventType,
        table,
        new:
          'new' in payload && payload.new
            ? (payload.new as Record<string, unknown>)
            : null,
        old:
          'old' in payload && payload.old
            ? (payload.old as { id: string })
            : null,
      };
      callbackRef.current?.(normalized);
    };

    const channel = client
      .channel(channelName)
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
        pgFilter,
        handlePayload,
      )
      .subscribe((subscriptionStatus) => {
        if (subscriptionStatus === 'SUBSCRIBED') {
          setStatus('connected');
        } else if (subscriptionStatus === 'CHANNEL_ERROR') {
          setStatus('error');
        } else if (subscriptionStatus === 'CLOSED') {
          setStatus('closed');
        }
      });

    channelRef.current = channel;

    return () => {
      setStatus('closed');
      void client.removeChannel(channel);
      channelRef.current = null;
    };
  }, [table, filter]);

  return { status };
}
