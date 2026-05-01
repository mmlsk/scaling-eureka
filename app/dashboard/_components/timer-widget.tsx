'use client';

import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useLifeOsStore } from '@/store/useLifeOsStore';
import { useHydration } from '@/hooks/useHydration';
import { fmtTime } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import { WidgetShell } from '@/components/ui/widget-shell';
import { Badge } from '@/components/ui/badge';

export default function TimerWidget() {
  const hydrated = useHydration();
  const timer = useLifeOsStore((s) => s.timer);
  const { startTimer, pauseTimer, resetTimer, cyclePreset } = useLifeOsStore(
    useShallow((s) => ({
      startTimer: s.startTimer,
      pauseTimer: s.pauseTimer,
      resetTimer: s.resetTimer,
      cyclePreset: s.cyclePreset,
    })),
  );

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Tick logic: decrement remaining every second when running
  useEffect(() => {
    if (!timer.running) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      useLifeOsStore.setState((state) => {
        if (!state.timer.running || state.timer.lastTick === null) return state;

        const now = Date.now();
        const elapsed = Math.floor((now - state.timer.lastTick) / 1000);
        if (elapsed < 1) return state;

        const remaining = Math.max(0, state.timer.remaining - elapsed);

        if (remaining === 0) {
          const preset = state.timer.presets[state.timer.presetIndex];
          if (!preset) return state;
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
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timer.running]);

  const preset = timer.presets[timer.presetIndex];
  const progressPct = timer.total > 0 ? ((timer.total - timer.remaining) / timer.total) * 100 : 0;

  return (
    <WidgetShell
      id="timer"
      title="Timer"
      isLoading={!hydrated}
      actions={
        <div className="flex items-center gap-2">
          <Badge>{preset?.label || 'Preset'}</Badge>
          <Badge>#{timer.session}</Badge>
        </div>
      }
    >
      {/* Time display */}
      <div
        className="text-center font-mono font-bold tracking-widest"
        style={{ fontSize: 'clamp(1.5rem, 1.2rem + 1.5vw, 2.5rem)' }}
      >
        {fmtTime(timer.remaining)}
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full my-3">
        <div
          className="h-full bg-primary rounded-full"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Preset info */}
      <div className="text-center mb-3 text-muted-foreground">
        {preset ? `${preset.work}min praca / ${preset.break}min przerwa` : 'No preset selected'}
      </div>

      {/* Controls */}
      <div className="flex gap-2 justify-center">
        {timer.running ? (
          <Button size="sm" onClick={pauseTimer}>
            Pauza
          </Button>
        ) : (
          <Button size="sm" onClick={startTimer}>
            Start
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={resetTimer}>
          Reset
        </Button>
        <Button variant="outline" size="sm" onClick={cyclePreset}>
          Preset
        </Button>
      </div>
    </WidgetShell>
  );
}
