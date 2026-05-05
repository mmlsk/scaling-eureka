'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { subscribeToTable } from '@/lib/db/sync';
import { ROOMS_KEY } from './use-rooms';
import { PINS_KEY } from './use-pins';
import type { Room } from '@/lib/types/floor-plan';

type RealtimePayload = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  new: Record<string, unknown> | null;
  old: { id: string } | null;
};

export function useFloorPlanRealtime() {
  const qc = useQueryClient();

  useEffect(() => {
    const channels = [
      // Subscribe to rooms changes
      subscribeToTable('rooms', (payload: RealtimePayload) => {
        const { eventType, new: newRecord, old } = payload;

        if (eventType === 'INSERT' && newRecord) {
          const room = newRecord as unknown as Room;
          qc.setQueryData<Room[]>(ROOMS_KEY, (oldData) => {
            if (!oldData) return [room];
            return [...oldData, room];
          });
        } else if (eventType === 'UPDATE' && newRecord) {
          const room = newRecord as unknown as Room;
          qc.setQueryData<Room[]>(ROOMS_KEY, (oldData) => {
            if (!oldData) return [room];
            return oldData.map((r) => (r.id === room.id ? room : r));
          });
        } else if (eventType === 'DELETE' && old) {
          qc.setQueryData<Room[]>(ROOMS_KEY, (oldData) => {
            if (!oldData) return [];
            return oldData.filter((r) => r.id !== old.id);
          });
        }
      }),

      // Subscribe to pins changes
      subscribeToTable('pins', (payload: RealtimePayload) => {
        const { eventType, new: newRecord, old } = payload;

        if (eventType === 'INSERT' && newRecord) {
          qc.invalidateQueries({ queryKey: PINS_KEY });
        } else if (eventType === 'UPDATE' && newRecord) {
          qc.invalidateQueries({ queryKey: PINS_KEY });
        } else if (eventType === 'DELETE' && old) {
          qc.invalidateQueries({ queryKey: PINS_KEY });
        }
      }),

      // Subscribe to checklist_items changes
      subscribeToTable('checklist_items', (_payload: RealtimePayload) => {
        qc.invalidateQueries({ queryKey: PINS_KEY });
      }),
    ];

    return () => {
      channels.forEach((ch) => ch.unsubscribe());
    };
  }, [qc]);
}
