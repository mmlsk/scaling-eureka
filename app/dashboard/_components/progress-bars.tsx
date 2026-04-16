'use client';

import { useState, useEffect, useMemo } from 'react';
import { useHydration } from '@/hooks/useHydration';

interface ProgressItem {
  label: string;
  pct: number;
}

function getDayProgress(now: Date): number {
  const totalMinutes = now.getHours() * 60 + now.getMinutes();
  return (totalMinutes / 1440) * 100;
}

function getWeekProgress(now: Date): number {
  // Monday = day 0, Sunday = day 6
  let dayOfWeek = now.getDay() - 1;
  if (dayOfWeek < 0) dayOfWeek = 6;

  const totalMinutes = now.getHours() * 60 + now.getMinutes();
  const minutesSinceMonday = dayOfWeek * 1440 + totalMinutes;
  const totalMinutesInWeek = 7 * 1440;

  return (minutesSinceMonday / totalMinutesInWeek) * 100;
}

function getMonthProgress(now: Date): number {
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  const totalMinutes = now.getHours() * 60 + now.getMinutes();
  const dayFraction = totalMinutes / 1440;

  return ((currentDay - 1 + dayFraction) / daysInMonth) * 100;
}

function getYearProgress(now: Date): number {
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
  const elapsed = now.getTime() - startOfYear.getTime();
  const total = endOfYear.getTime() - startOfYear.getTime();

  return (elapsed / total) * 100;
}

export default function ProgressBars() {
  const hydrated = useHydration();
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60_000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const items: ProgressItem[] = useMemo(
    () => [
      { label: 'Dzień', pct: getDayProgress(now) },
      { label: 'Tydzień', pct: getWeekProgress(now) },
      { label: 'Miesiąc', pct: getMonthProgress(now) },
      { label: 'Rok', pct: getYearProgress(now) },
    ],
    [now],
  );

  if (!hydrated) {
    return (
      <div className="widget">
        <div className="widget-header">Postęp</div>
        <div className="widget-body space-y-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i}>
              <div className="skeleton" style={{ height: '0.6rem', width: '3rem', marginBottom: '0.25rem' }} />
              <div className="skeleton" style={{ height: '6px', width: '100%' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="widget">
      <div className="widget-header">Postęp</div>
      <div className="widget-body space-y-2">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between mb-0.5">
              <span className="text-[clamp(0.5rem,0.48rem+0.1vw,0.6rem)]" style={{ color: 'var(--txm)' }}>
                {item.label}
              </span>
              <span
                className="font-mono text-[clamp(0.5rem,0.48rem+0.1vw,0.6rem)]"
                style={{ color: 'var(--a1)' }}
              >
                {item.pct.toFixed(1)}%
              </span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${Math.min(item.pct, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
