'use client';

import { useState, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useLifeOsStore } from '@/store/useLifeOsStore';
import { useHydration } from '@/hooks/useHydration';

type SleepQuality = 'bad' | 'med' | 'good';

const QUALITY_LABELS: Record<SleepQuality, string> = {
  bad: 'Bad',
  med: 'Med',
  good: 'Good',
};

const QUALITY_CLASSES: Record<SleepQuality, string> = {
  bad: 'crit',
  med: 'warn',
  good: 'ok',
};

export default function SleepWidget() {
  const hydrated = useHydration();
  const { sleep, setSleep } = useLifeOsStore(
    useShallow((s) => ({ sleep: s.sleep, setSleep: s.setSleep })),
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

  if (!hydrated) {
    return (
      <div className="widget">
        <div className="widget-header">Sen</div>
        <div className="widget-body">
          <div className="skeleton" style={{ height: '1.5rem', width: '100%', marginBottom: '0.5rem' }} />
          <div className="skeleton" style={{ height: '1rem', width: '60%' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="widget">
      <div className="widget-header">
        <span>Sen</span>
        {sleep.total && <span className="pill ok">{sleep.total}</span>}
      </div>
      <div className="widget-body">
        <div className="flex gap-3 mb-3">
          {/* Sleep Start */}
          <div className="flex-1">
            <div className="text-[clamp(0.5rem,0.48rem+0.1vw,0.6rem)] mb-1" style={{ color: 'var(--txm)' }}>
              Zasnięcie
            </div>
            {editingField === 'start' ? (
              <input
                type="time"
                className="input-field mono"
                defaultValue={sleep.start ?? ''}
                autoFocus
                onBlur={(e) => handleTimeChange('start', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTimeChange('start', (e.target as HTMLInputElement).value);
                  }
                }}
              />
            ) : (
              <button
                className="btn-secondary w-full text-left font-mono"
                onClick={() => setEditingField('start')}
              >
                {sleep.start ?? '--:--'}
              </button>
            )}
          </div>

          {/* Sleep Stop */}
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
                onBlur={(e) => handleTimeChange('stop', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTimeChange('stop', (e.target as HTMLInputElement).value);
                  }
                }}
              />
            ) : (
              <button
                className="btn-secondary w-full text-left font-mono"
                onClick={() => setEditingField('stop')}
              >
                {sleep.stop ?? '--:--'}
              </button>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between mb-3">
          <span style={{ color: 'var(--txm)' }}>Czas snu</span>
          <span className="font-mono font-semibold" style={{ fontSize: 'clamp(0.8rem, 0.7rem + 0.3vw, 1rem)' }}>
            {sleep.total ?? '—'}
          </span>
        </div>

        {/* Quality Buttons */}
        <div className="flex gap-2">
          {(Object.keys(QUALITY_LABELS) as SleepQuality[]).map((q) => (
            <button
              key={q}
              className={`feeling-chip flex-1 text-center ${quality === q ? 'selected' : ''}`}
              onClick={() => setQuality(q)}
            >
              <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${quality === q ? '' : ''}`}
                style={{ background: quality === q ? `var(--${QUALITY_CLASSES[q] === 'ok' ? 'nom' : QUALITY_CLASSES[q] === 'warn' ? 'a1' : 'az'})` : 'var(--txm)' }}
              />
              {QUALITY_LABELS[q]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
