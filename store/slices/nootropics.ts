// @ts-nocheck
import type { StateCreator } from 'zustand';
import type { LocalNootropic } from '@/types/state';

/**
 * NootropicsSlice — offline fallback store.
 * Source of truth: Supabase via TanStack Query (lib/queries/use-nootropics.ts).
 * This slice remains for offline-first localStorage persistence when Supabase
 * is unreachable; UI components should prefer the TanStack Query hooks.
 */
export interface NootropicsSlice {
  nootropics: LocalNootropic[];
  nootropicLog: Record<string, Record<string, string>>;
  addNootropic: (name: string, dose: string) => void;
  removeNootropic: (index: number) => void;
  toggleNootropicStatus: (index: number) => void;
}

const STATUS_CYCLE: LocalNootropic['status'][] = ['pending', 'taken', 'skipped'];

export const createNootropicsSlice: StateCreator<
  NootropicsSlice,
  [],
  [],
  NootropicsSlice
> = (set) => ({
  nootropics: [],
  nootropicLog: {},

  addNootropic: (name, dose) =>
    set((state) => ({
      nootropics: [
        ...state.nootropics,
        { name, dose, status: 'pending' as const },
      ],
    })),

  removeNootropic: (index) =>
    set((state) => ({
      nootropics: state.nootropics.filter((_, i) => i !== index),
    })),

  toggleNootropicStatus: (index) =>
    set((state) => {
      const today = new Date().toISOString().slice(0, 10);
      const updated: LocalNootropic[] = state.nootropics.map((noot, i) => {
        if (i !== index) return noot;

        const currentIdx = STATUS_CYCLE.indexOf(noot.status);
        const nextStatus = STATUS_CYCLE[(currentIdx + 1) % STATUS_CYCLE.length];

        return { ...noot, status: nextStatus };
      });

      const noot = state.nootropics[index];
      if (!noot) return { nootropics: updated, nootropicLog: state.nootropicLog };

      const nextStatus =
        STATUS_CYCLE[
          (STATUS_CYCLE.indexOf(noot.status) + 1) % STATUS_CYCLE.length
        ];

      return {
        nootropics: updated,
        nootropicLog: {
          ...state.nootropicLog,
          [today]: {
            ...state.nootropicLog[today],
            [noot.name]: nextStatus,
          },
        },
      };
    }),
});
