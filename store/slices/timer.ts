import type { StateCreator } from 'zustand';
import type { TimerState, TimerPreset } from '@/types/state';

export interface TimerSlice {
  timer: TimerState;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  cyclePreset: () => void;
  tick: () => void;
}

const DEFAULT_PRESETS: TimerPreset[] = [
  { work: 25, break: 5, label: 'Pomodoro' },
  { work: 50, break: 10, label: 'Deep Work' },
  { work: 90, break: 20, label: 'Ultra' },
];

function makeInitialTimer(): TimerState {
  const preset = DEFAULT_PRESETS[0]!;
  return {
    presetIndex: 0,
    presets: DEFAULT_PRESETS,
    running: false,
    remaining: preset.work * 60,
    total: preset.work * 60,
    session: 0,
    lastTick: null,
  };
}

export const createTimerSlice: StateCreator<TimerSlice, [], [], TimerSlice> = (set) => ({
  timer: makeInitialTimer(),

  startTimer: () =>
    set((state) => ({
      timer: {
        ...state.timer,
        running: true,
        lastTick: Date.now(),
      },
    })),

  pauseTimer: () =>
    set((state) => ({
      timer: {
        ...state.timer,
        running: false,
        lastTick: null,
      },
    })),

  resetTimer: () =>
    set((state) => {
      const preset = state.timer.presets[state.timer.presetIndex]!;
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
      const nextIndex = (state.timer.presetIndex + 1) % state.timer.presets.length;
      const preset = state.timer.presets[nextIndex]!;
      return {
        timer: {
          ...state.timer,
          presetIndex: nextIndex,
          running: false,
          remaining: preset.work * 60,
          total: preset.work * 60,
          session: 0,
          lastTick: null,
        },
      };
    }),

  tick: () =>
    set((state) => {
      if (!state.timer.running || state.timer.lastTick === null) return state;

      const now = Date.now();
      const elapsed = Math.floor((now - state.timer.lastTick) / 1000);
      if (elapsed < 1) return state;

      const remaining = Math.max(0, state.timer.remaining - elapsed);

      if (remaining === 0) {
        const preset = state.timer.presets[state.timer.presetIndex]!;
        return {
          timer: {
            ...state.timer,
            running: false,
            remaining: preset.break * 60,
            total: preset.break * 60,
            session: state.timer.session + 1,
            lastTick: null,
          },
        };
      }

      return {
        timer: {
          ...state.timer,
          remaining,
          lastTick: now,
        },
      };
    }),
});
