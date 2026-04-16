'use client';

import { useState, useEffect } from 'react';
import { useHydration } from '@/hooks/useHydration';
import { formatTime, formatDate } from '@/lib/utils/date';

function getNYTime(now: Date): string {
  const nyFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  return nyFormatter.format(now);
}

function isNYSEOpen(now: Date): boolean {
  const nyDate = new Date(
    now.toLocaleString('en-US', { timeZone: 'America/New_York' }),
  );
  const day = nyDate.getDay();
  if (day === 0 || day === 6) return false;

  const hours = nyDate.getHours();
  const minutes = nyDate.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  // NYSE: 9:30 AM - 4:00 PM ET
  return totalMinutes >= 570 && totalMinutes < 960;
}

export default function ClockWidget() {
  const hydrated = useHydration();
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!hydrated) {
    return (
      <div className="widget">
        <div className="widget-header">Zegar</div>
        <div className="widget-body">
          <div className="skeleton" style={{ height: '2rem', width: '60%', marginBottom: '0.5rem' }} />
          <div className="skeleton" style={{ height: '0.75rem', width: '80%' }} />
        </div>
      </div>
    );
  }

  const localTime = formatTime(now);
  const nyTime = getNYTime(now);
  const dateStr = formatDate(now);
  const marketOpen = isNYSEOpen(now);

  return (
    <div className="widget">
      <div className="widget-header">
        <span>Zegar</span>
        <span className="flex items-center gap-1">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: marketOpen ? 'var(--nom)' : 'var(--az)' }}
          />
          <span className="text-[clamp(0.5rem,0.48rem+0.1vw,0.6rem)]">
            NYSE {marketOpen ? 'open' : 'closed'}
          </span>
        </span>
      </div>
      <div className="widget-body">
        <div
          className="font-mono font-semibold tracking-wider"
          style={{ fontSize: 'clamp(1.4rem, 1.2rem + 1vw, 2rem)' }}
        >
          {localTime}
        </div>
        <div className="flex items-center justify-between mt-1">
          <span style={{ color: 'var(--txm)' }}>{dateStr}</span>
          <span className="pill">NY {nyTime}</span>
        </div>
      </div>
    </div>
  );
}
