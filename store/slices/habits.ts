import type { StateCreator } from 'zustand';
import type { LocalHabit } from '@/types/state';

/**
 * HabitsSlice — offline fallback store.
 * Source of truth: Supabase via TanStack Query (lib/queries/use-habits.ts).
 * This slice remains for offline-first localStorage persistence when Supabase
 * is unreachable; UI components should prefer the TanStack Query hooks.
 */
export interface HabitsSlice {
  habits: LocalHabit[];
  addHabit: (name: string) => void;
  removeHabit: (index: number) => void;
  toggleHabitDay: (habitIndex: number, dayOffset: number) => void;
}

export const createHabitsSlice: StateCreator<HabitsSlice, [], [], HabitsSlice> = (set) => ({
  habits: [],

  addHabit: (name) =>
    set((state) => {
      const newHabit: LocalHabit = { n: name, d: [], s: 0 };
      return {
        habits: [...state.habits, newHabit],
      };
    }),

  removeHabit: (index) =>
    set((state) => ({
      habits: state.habits.filter((_, i) => i !== index),
    })),

  toggleHabitDay: (habitIndex, dayOffset) =>
    set((state) => {
      const updated = state.habits.map((habit, i) => {
        if (i !== habitIndex) return habit;

        const days = habit.d.includes(dayOffset)
          ? habit.d.filter((d) => d !== dayOffset)
          : [...habit.d, dayOffset];

        const streak = computeStreak(days);

        return {
          ...habit,
          d: days,
          s: streak,
          lastDate: new Date().toISOString().slice(0, 10),
        };
      });

      return { habits: updated };
    }),
});

/**
 * Compute the current streak: count consecutive days starting from 0
 * (today) going backwards in the `days` array of offsets.
 */
function computeStreak(days: number[]): number {
  const sorted = [...new Set(days)].sort((a, b) => a - b);
  if (!sorted.includes(0)) return 0;

  let streak = 1;
  for (let i = 1; i <= sorted.length; i++) {
    if (sorted.includes(i)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
