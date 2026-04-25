import type { StateCreator } from 'zustand';
import type { SleepState } from '@/types/state';

/**
 * SleepSlice — offline fallback store.
 * Source of truth: Supabase via TanStack Query (lib/queries/use-sleep.ts).
 * This slice remains for offline-first localStorage persistence when Supabase
 * is unreachable; UI components should prefer the TanStack Query hooks.
 */
export interface SleepSlice {
  sleep: SleepState;
  sleepLog: Record<string, Record<string, string>>;
  sleepQuality: 'bad' | 'med' | 'good';
  setSleepField: (field: keyof SleepState, value: string | null) => void;
  setQuality: (quality: 'bad' | 'med' | 'good') => void;
}

export const createSleepSlice: StateCreator<SleepSlice, [], [], SleepSlice> = (set) => ({
  sleep: { start: null, stop: null, total: null },
  sleepLog: {},
  sleepQuality: 'med',

  setSleepField: (field, value) =>
    set((state) => {
      const updated: SleepState = { ...state.sleep, [field]: value };

      if (updated.start && updated.stop) {
        const startMs = parseTimeToMinutes(updated.start);
        const stopMs = parseTimeToMinutes(updated.stop);
        if (startMs !== null && stopMs !== null) {
          let diff = stopMs - startMs;
          if (diff < 0) diff += 24 * 60;
          const hours = Math.floor(diff / 60);
          const mins = diff % 60;
          updated.total = `${hours}h ${mins}m`;
        }
      }

      const today = new Date().toISOString().slice(0, 10);
      return {
        sleep: updated,
        sleepLog: {
          ...state.sleepLog,
          [today]: {
            ...state.sleepLog[today],
            [field]: value ?? '',
            ...(updated.total ? { total: updated.total } : {}),
          },
        },
      };
    }),

  setQuality: (quality) =>
    set((state) => {
      const today = new Date().toISOString().slice(0, 10);
      return {
        sleepQuality: quality,
        sleepLog: {
          ...state.sleepLog,
          [today]: {
            ...state.sleepLog[today],
            quality,
          },
        },
      };
    }),
});

function parseTimeToMinutes(time: string): number | null {
  const parts = time.split(':');
  if (parts.length !== 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}
