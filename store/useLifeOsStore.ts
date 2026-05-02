import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SleepState, TimerPreset, Palette } from '@/types/state';

export interface PaletteSlice {
  palette: Palette;
  theme: 'dark' | 'light';
  setPalette: (palette: Palette) => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export interface SleepEntry {
  bedtime: string;
  waketime: string;
  date: string;
}

export interface SleepUISlice {
  sleep: SleepState;
  sleepLog: SleepEntry[];
  setSleep: (field: keyof SleepState, value: string | null) => void;
  addSleepEntry: (entry: SleepEntry) => void;
  getSleepDuration: (date: string) => number | null;
}

export interface FeelingsSlice {
  feelings: string[];
  feelingOptions: string[];
  toggleFeeling: (feeling: string) => void;
}

export interface TimerUISlice {
  timer: {
    presetIndex: number;
    presets: TimerPreset[];
    running: boolean;
    remaining: number;
    total: number;
    session: number;
    lastTick: number | null;
  };
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  cyclePreset: () => void;
  setTimerPreset: (minutes: number) => void;
  getTimerPreset: () => number;
}

export type LifeOsStore = PaletteSlice & SleepUISlice & FeelingsSlice & TimerUISlice;

const DEFAULT_PRESETS: TimerPreset[] = [
  { work: 25, break: 5, label: 'Pomodoro' },
  { work: 50, break: 10, label: 'Deep Work' },
  { work: 90, break: 20, label: 'Ultra' },
];

const DEFAULT_FEELING_OPTIONS = [
  'energetic',
  'focused',
  'calm',
  'anxious',
  'tired',
  'happy',
  'stressed',
  'creative',
  'motivated',
  'foggy',
];

const storage = {
  getItem: (name: string) => {
    try {
      const value = localStorage.getItem(name);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: unknown) => {
    try {
      localStorage.setItem(name, JSON.stringify(value));
    } catch {
      // Ignore storage errors
    }
  },
  removeItem: (name: string) => {
    try {
      localStorage.removeItem(name);
    } catch {
      // Ignore storage errors
    }
  },
};

export const useLifeOsStore = create<LifeOsStore>()(
  persist(
    (set, get) => ({
      // --- Palette / Theme ---
      palette: 'reaktor' as Palette,
      theme: 'dark' as const,

      setPalette: (palette) => set({ palette }),
      setTheme: (theme) => set({ theme }),

      // --- Sleep ---
      sleep: { start: null, stop: null, total: null },
      sleepLog: [],

      setSleep: (field, value) =>
        set((state) => {
          const updated: SleepState = { ...state.sleep, [field]: value };

          if (updated.start && updated.stop) {
            const startMins = parseHHMM(updated.start);
            const stopMins = parseHHMM(updated.stop);
            if (startMins !== null && stopMins !== null) {
              let diff = stopMins - startMins;
              if (diff < 0) diff += 24 * 60;
              const h = Math.floor(diff / 60);
              const m = diff % 60;
              updated.total = `${h}h ${m}m`;
            }
          }

          return { sleep: updated };
        }),

      addSleepEntry: (entry) =>
        set((state) => ({
          sleepLog: [...state.sleepLog, entry],
        })),

      getSleepDuration: (date: string): number | null => {
        const { sleepLog } = get();
        const entry = sleepLog.find((e) => e.date === date);
        if (!entry) return null;
        const bedMins = parseHHMM(entry.bedtime);
        const wakeMins = parseHHMM(entry.waketime);
        if (bedMins === null || wakeMins === null) return null;
        let diff = wakeMins - bedMins;
        if (diff <= 0) diff += 24 * 60;
        return diff / 60;
      },

      // --- Feelings ---
      feelings: [],
      feelingOptions: DEFAULT_FEELING_OPTIONS,

      toggleFeeling: (feeling) =>
        set((state) => ({
          feelings: state.feelings.includes(feeling)
            ? state.feelings.filter((f) => f !== feeling)
            : [...state.feelings, feeling],
        })),

      // --- Timer ---
      timer: {
        presetIndex: 0,
        presets: DEFAULT_PRESETS,
        running: false,
        remaining: DEFAULT_PRESETS[0].work * 60,
        total: DEFAULT_PRESETS[0].work * 60,
        session: 0,
        lastTick: null,
      },

      startTimer: () =>
        set((state) => ({
          timer: { ...state.timer, running: true, lastTick: Date.now() },
        })),

      pauseTimer: () =>
        set((state) => ({
          timer: { ...state.timer, running: false, lastTick: null },
        })),

      resetTimer: () =>
        set((state) => {
          const preset = state.timer.presets[state.timer.presetIndex];
          return {
            timer: {
              ...state.timer,
              running: false,
              remaining: preset.work * 60,
              total: preset.work * 60,
              lastTick: null,
            },
          };
        }),

      cyclePreset: () =>
        set((state) => {
          const nextIdx = (state.timer.presetIndex + 1) % state.timer.presets.length;
          const preset = state.timer.presets[nextIdx];
          return {
            timer: {
              ...state.timer,
              presetIndex: nextIdx,
              running: false,
              remaining: preset.work * 60,
              total: preset.work * 60,
              session: 0,
              lastTick: null,
            },
          };
        }),

      setTimerPreset: (minutes) =>
        set((state) => {
          const idx = state.timer.presets.findIndex((p) => p.work === minutes);
          if (idx === -1) return state;
          const preset = state.timer.presets[idx];
          return {
            timer: {
              ...state.timer,
              presetIndex: idx,
              running: false,
              remaining: preset.work * 60,
              total: preset.work * 60,
              session: 0,
              lastTick: null,
            },
          };
        }),

      getTimerPreset: (): number => {
        const { timer } = get();
        return timer.presets[timer.presetIndex].work;
      },
    }),
    {
      name: 'life-os-store',
      storage,
      partialize: (state) => ({
        palette: state.palette,
        theme: state.theme,
        sleep: state.sleep,
        sleepLog: state.sleepLog,
        feelings: state.feelings,
        timer: {
          presetIndex: state.timer.presetIndex,
          presets: state.timer.presets,
          running: false,
          remaining: state.timer.remaining,
          total: state.timer.total,
          session: state.timer.session,
          lastTick: null,
        },
      }),
    },
  ),
);

function parseHHMM(time: string): number | null {
  const parts = time.split(':');
  if (parts.length !== 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}
