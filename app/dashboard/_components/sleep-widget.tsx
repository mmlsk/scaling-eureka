'use client';

import { useState, useCallback, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useLifeOsStore } from '@/store/useLifeOsStore';
import { useHydration } from '@/hooks/useHydration';

type SleepQuality = 'bad' | 'med' | 'good';

const QUALITY_LABELS: Record<SleepQuality, string> = {
  bad: 'Bad',
  med: 'Med',
  good: 'Good',
};

const QUALITY_COLORS: Record<SleepQuality, string> = {
  bad: 'var(--az)',
  med: 'var(--a1)',
  good: 'var(--nom)',
};

function parseHHMM(time: string): number | null {
  const parts = time.split(':');
  if (parts.length !== 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

export default function SleepWidget() {
  const hydrated = useHydration();
  const { sleep, setSleep, sleepLog, getSleepDuration } = useLifeOsStore(
    useShallow((s) => ({
      sleep: s.sleep,
      setSleep: s.setSleep,
      sleepLog: s.sleepLog,
      getSleepDuration: s.getSleepDuration,
    })),
  );

  const [editingField, setEditingField] = useState<'start' | 'stop' | null>(null);
  const [quality, setQuality] = useState<SleepQuality>('med');

  const handleTimeChange = useCallback(
    (field: 'start' | 'stop', value: string) => {
      setSleep(field, value);
      setEditingField(null);
    },
    [setSleep],
  );

  // Compute 7-day sleep data from sleepLog entries
  const weekData = useMemo(() => {
    const days: { date: string; hours: number | null; bedtime: number | null }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const entry = sleepLog.find((e) => e.date === key);
      let hours: number | null = null;
      let bedtime: number | null = null;
      if (entry) {
        const bedMins = parseHHMM(entry.bedtime);
        const wakeMins = parseHHMM(entry.waketime);
        if (bedMins != null && wakeMins != null) {
          let diff = wakeMins - bedMins;
          if (diff <= 0) diff += 24 * 60;
          hours = diff / 60;
        }
        bedtime = bedMins;
      }
      days.push({ date: key, hours, bedtime });
    }
    return days;
  }, [sleepLog]);

  const validHours = weekData.filter((d) => d.hours != null).map((d) => d.hours!);
  const avgHours = validHours.length > 0 ? validHours.reduce((a, b) => a + b, 0) / validHours.length : null;
  const totalWeekHours = validHours.reduce((a, b) => a + b, 0);
  const sleepDebt = 56 - totalWeekHours; // target 8h * 7 = 56h

  // Bedtime consistency (std dev of bedtime)
  const validBedtimes = weekData.filter((d) => d.bedtime != null).map((d) => {
    let s = d.bedtime!;
    if (s > 720) s -= 1440; // normalize late-night times
    return s;
  });
  const bedtimeStdDev = validBedtimes.length > 1
    ? (() => {
        const mean = validBedtimes.reduce((a, b) => a + b, 0) / validBedtimes.length;
        const variance = validBedtimes.reduce((a, b) => a + (b - mean) ** 2, 0) / validBedtimes.length;
        return Math.sqrt(variance);
      })()
    : null;

  if (!hydrated) {
    return (
      <div className="widget" aria-label="Widget: Sen">
        <div className="widget-header">Sen</div>
        <div className="widget-body">
          <div className="skeleton" style={{ height: '1.5rem', width: '100%', marginBottom: '0.5rem' }} />
          <div className="skeleton" style={{ height: '1rem', width: '60%' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="widget" aria-label="Widget: Sen">
      <div className="widget-header">
        <span>Sen</span>
        {sleep.total && <span className="pill ok">{sleep.total}</span>}
      </div>
      <div className="widget-body">
        {/* Time inputs */}
        <div className="flex gap-3 mb-3">
          <div className="flex-1">
            <div className="text-[clamp(0.5rem,0.48rem+0.1vw,0.6rem)] mb-1" style={{ color: 'var(--txm)' }}>
              Zasniecie
            </div>
            {editingField === 'start' ? (
              <input
                type="time"
                className="input-field mono"
                defaultValue={sleep.start ?? ''}
                autoFocus
                aria-label="Godzina zasniecia"
                onBlur={(e) => handleTimeChange('start', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTimeChange('start', (e.target as HTMLInputElement).value);
                }}
              />
            ) : (
              <button className="btn-secondary w-full text-left font-mono" onClick={() => setEditingField('start')}>
                {sleep.start ?? '--:--'}
              </button>
            )}
          </div>
          <div className="flex-1">
            <div className="text-[clamp(0.5rem,0.48rem+0.1vw,0.6rem)] mb-1" style={{ color: 'var(--txm)' }}>
              Pobudka
            </div>
            {editingField === 'stop' ? (
              <input
                type="time"
                className="input-field mono"
                defaultValue={sleep.stop ?? ''}
                autoFocus
                aria-label="Godzina pobudki"
                onBlur={(e) => handleTimeChange('stop', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTimeChange('stop', (e.target as HTMLInputElement).value);
                }}
              />
            ) : (
              <button className="btn-secondary w-full text-left font-mono" onClick={() => setEditingField('stop')}>
                {sleep.stop ?? '--:--'}
              </button>
            )}
          </div>
        </div>

        {/* Quality */}
        <div className="flex gap-2 mb-3">
          {(Object.keys(QUALITY_LABELS) as SleepQuality[]).map((q) => (
            <button
              key={q}
              className={`feeling-chip flex-1 text-center ${quality === q ? 'selected' : ''}`}
              onClick={() => setQuality(q)}
              aria-label={`Jakosc snu: ${QUALITY_LABELS[q]}`}
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full mr-1"
                style={{ background: quality === q ? QUALITY_COLORS[q] : 'var(--txm)' }}
              />
              {QUALITY_LABELS[q]}
            </button>
          ))}
        </div>

        {/* 7-day bar chart */}
        {validHours.length > 0 && (
          <div className="mb-2">
            <div
              className="flex justify-between mb-1"
              style={{ fontSize: 'clamp(0.45rem, 0.43rem + 0.08vw, 0.52rem)', color: 'var(--txm)' }}
            >
              <span>Ostatnie 7 dni</span>
              {avgHours != null && <span>Srednia: {avgHours.toFixed(1)}h</span>}
            </div>
            <div className="flex gap-0.5 items-end" style={{ height: '2.5rem' }}>
              {weekData.map((d) => {
                const h = d.hours ?? 0;
                const pct = Math.min(100, (h / 10) * 100);
                const isGood = h >= 7;
                return (
                  <div
                    key={d.date}
                    className="flex-1 rounded-t"
                    style={{
                      height: `${pct}%`,
                      minHeight: h > 0 ? '2px' : 0,
                      background: isGood ? 'var(--nom)' : h > 0 ? 'var(--a1)' : 'var(--soff)',
                      opacity: h > 0 ? 0.8 : 0.3,
                    }}
                    title={`${new Date(d.date).toLocaleDateString('pl-PL', { weekday: 'short' })}: ${h > 0 ? h.toFixed(1) + 'h' : 'brak'}`}
                  />
                );
              })}
            </div>
            <div
              className="flex justify-between"
              style={{ fontSize: 'clamp(0.4rem, 0.38rem + 0.06vw, 0.48rem)', color: 'var(--txf)' }}
            >
              {weekData.map((d) => (
                <span key={d.date} className="flex-1 text-center">
                  {new Date(d.date).toLocaleDateString('pl-PL', { weekday: 'narrow' })}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats row */}
        {validHours.length > 0 && (
          <div
            className="flex justify-between pt-1"
            style={{ borderTop: '1px solid var(--div)', fontSize: 'clamp(0.45rem, 0.43rem + 0.08vw, 0.52rem)', color: 'var(--txm)' }}
          >
            <span>
              Dlug snu:{' '}
              <span
                className="font-mono"
                style={{ color: sleepDebt > 0 ? 'var(--az)' : 'var(--nom)' }}
              >
                {sleepDebt > 0 ? `-${sleepDebt.toFixed(1)}h` : `+${Math.abs(sleepDebt).toFixed(1)}h`}
              </span>
            </span>
            {bedtimeStdDev != null && (
              <span>
                Regularnosc:{' '}
                <span className="font-mono">
                  \u00B1{Math.round(bedtimeStdDev)}min
                </span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
