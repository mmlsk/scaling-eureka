'use client';

import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HabitsSlice } from '@/store/slices/habits';
import { createHabitsSlice } from '@/store/slices/habits';
import type { NootropicsSlice } from '@/store/slices/nootropics';
import { createNootropicsSlice } from '@/store/slices/nootropics';
import { useLifeOsStore } from '@/store/useLifeOsStore';
import { useHydration } from '@/hooks/useHydration';
import { WidgetShell } from '@/components/ui/widget-shell';
import { Badge } from '@/components/ui/badge';

/** Isolate timer session count so ticking doesn't re-render analytics */
const useTimerSession = () => useLifeOsStore((s) => s.timer.session);

const useHabitsStore = create<HabitsSlice>()(
  persist(createHabitsSlice, { name: 'life-os-habits' }),
);

const useNootropicsStore = create<NootropicsSlice>()(
  persist(createNootropicsSlice, { name: 'life-os-nootropics' }),
);

const CHART_DAYS = 14;
const CHART_W = 280;
const CHART_H = 80;
const HEATMAP_COLS = 14;
const HEATMAP_ROWS = 4;

function computeCompletionRates(habits: HabitsSlice['habits']): number[] {
  const rates: number[] = [];
  for (let dayOffset = CHART_DAYS - 1; dayOffset >= 0; dayOffset--) {
    if (habits.length === 0) {
      rates.push(0);
      continue;
    }
    const completed = habits.filter((h) => h.d.includes(dayOffset)).length;
    rates.push((completed / habits.length) * 100);
  }
  return rates;
}

function TrendChart({ data }: { data: number[] }) {
  if (data.length < 2) {
    return (
      <div className="text-center py-2 text-muted-foreground">
        Za mało danych
      </div>
    );
  }

  const maxVal = Math.max(...data, 1);
  const padX = 24;
  const padY = 10;
  const plotW = CHART_W - padX * 2;
  const plotH = CHART_H - padY * 2;

  const points = data.map((v, i) => {
    const x = padX + (i / (data.length - 1)) * plotW;
    const y = padY + plotH - (v / maxVal) * plotH;
    return { x, y };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const areaD =
    points.length > 0
      ? pathD +
        ` L ${points[points.length - 1]!.x} ${padY + plotH} L ${points[0]!.x} ${padY + plotH} Z`
      : '';

  return (
    <svg width={CHART_W} height={CHART_H} className="w-full" viewBox={`0 0 ${CHART_W} ${CHART_H}`}>
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map((pct) => {
        const y = padY + plotH - (pct / maxVal) * plotH;
        return (
          <g key={pct}>
            <line
              x1={padX}
              y1={y}
              x2={CHART_W - padX}
              y2={y}
              stroke="var(--div)"
              strokeWidth="0.5"
            />
            <text
              x={padX - 4}
              y={y + 3}
              textAnchor="end"
              fill="var(--txm)"
              fontSize="7"
              fontFamily="IBM Plex Mono, monospace"
            >
              {pct}%
            </text>
          </g>
        );
      })}

      {/* Area fill */}
      <path d={areaD} fill="var(--a1d)" />

      {/* Line */}
      <path d={pathD} fill="none" stroke="var(--a1)" strokeWidth="1.5" />

      {/* Data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2" fill="var(--a1)" />
      ))}
    </svg>
  );
}

function HeatmapGrid({ habits }: { habits: HabitsSlice['habits'] }) {
  const cells: Array<{ row: number; col: number; level: number }> = [];

  for (let row = 0; row < HEATMAP_ROWS; row++) {
    for (let col = 0; col < HEATMAP_COLS; col++) {
      const dayOffset = HEATMAP_COLS - 1 - col;
      const habitIdx = row;

      if (habitIdx < habits.length) {
        const habit = habits[habitIdx];
        if (habit) {
          const done = habit.d.includes(dayOffset);
          const level = done ? 4 : 0;
          cells.push({ row, col, level });
        } else {
          cells.push({ row, col, level: 0 });
        }
      } else {
        cells.push({ row, col, level: 0 });
      }
    }
  }

  return (
    <div className="inline-grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${HEATMAP_COLS}, 14px)` }}>
      {cells.map((cell, idx) => (
        <div
          key={idx}
          className={`w-3 h-3 rounded-sm ${cell.level > 0 ? 'bg-primary/80' : 'bg-muted'}`}
        />
      ))}
    </div>
  );
}

function CorrelationBar({
  label,
  value,
  maxValue,
}: {
  label: string;
  value: number;
  maxValue: number;
}) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;

  return (
    <div className="flex items-center gap-2 mb-1">
      <span className="text-[clamp(0.45rem,0.43rem+0.08vw,0.55rem)] w-24 truncate text-muted-foreground">
        {label}
      </span>
      <div className="flex-1">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className="font-mono text-[clamp(0.45rem,0.43rem+0.08vw,0.55rem)]" style={{ minWidth: '2rem', textAlign: 'right' }}>
        {value.toFixed(0)}%
      </span>
    </div>
  );
}

export default function AnalyticsWidget() {
  const hydrated = useHydration();
  const habits = useHabitsStore((s) => s.habits);
  const nootropics = useNootropicsStore((s) => s.nootropics);
  const timerSession = useTimerSession();

  const completionRates = useMemo(() => computeCompletionRates(habits), [habits]);

  const avgCompletion = useMemo(() => {
    if (completionRates.length === 0) return 0;
    const sum = completionRates.reduce((a, b) => a + b, 0);
    return sum / completionRates.length;
  }, [completionRates]);

  const nootropicsTakenPct = useMemo(() => {
    if (nootropics.length === 0) return 0;
    const taken = nootropics.filter((n) => n.status === 'taken').length;
    return (taken / nootropics.length) * 100;
  }, [nootropics]);

  return (
    <WidgetShell
      id="analytics"
      title="Analityka"
      isLoading={!hydrated}
    >
      {/* Summary pills */}
      <div className="flex gap-2 mb-3">
        <Badge variant={avgCompletion >= 70 ? 'default' : avgCompletion >= 40 ? 'secondary' : 'destructive'}>
          Nawyki: {avgCompletion.toFixed(0)}%
        </Badge>
        <Badge variant={nootropicsTakenPct >= 80 ? 'default' : nootropicsTakenPct >= 50 ? 'secondary' : 'destructive'}>
          Nootropy: {nootropicsTakenPct.toFixed(0)}%
        </Badge>
        <Badge variant="outline">
          Pomodoro: {timerSession}
        </Badge>
      </div>

      {/* Trend chart */}
      <div className="mb-3">
        <div className="text-[clamp(0.5rem,0.48rem+0.1vw,0.6rem)] mb-1 text-muted-foreground">
          Ukończenie nawyków (14 dni)
        </div>
        <TrendChart data={completionRates} />
      </div>

      {/* Heatmap */}
      <div className="mb-3">
        <div className="text-[clamp(0.5rem,0.48rem+0.1vw,0.6rem)] mb-1 text-muted-foreground">
          Heatmapa nawyków
        </div>
        <HeatmapGrid habits={habits} />
      </div>

      {/* Correlations */}
      <div>
        <div className="text-[clamp(0.5rem,0.48rem+0.1vw,0.6rem)] mb-1 text-muted-foreground">
          Korelacje
        </div>
        <CorrelationBar
          label="Nootropy vs Nawyki"
          value={Math.min(nootropicsTakenPct, avgCompletion)}
          maxValue={100}
        />
        <CorrelationBar
          label="Pomodoro sesje"
          value={Math.min(timerSession * 10, 100)}
          maxValue={100}
        />
        <CorrelationBar
          label="Ogólna produktywność"
          value={(avgCompletion + nootropicsTakenPct + Math.min(timerSession * 10, 100)) / 3}
          maxValue={100}
        />
      </div>
    </WidgetShell>
  );
}
