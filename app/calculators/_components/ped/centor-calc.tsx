'use client';

import { useState } from 'react';
import { calcCentor } from '@/lib/calculators/formulas';

const CRITERIA = [
  'Gorączka >38°C',
  'Brak kaszlu',
  'Obrzęk / wysięk migdałków',
  'Tkliwe węzły chłonne szyjne przednie',
];

const AGE_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: '3-14 lat (+1)' },
  { value: 0, label: '15-44 lat (0)' },
  { value: -1, label: '≥45 lat (-1)' },
];

export default function CentorCalc() {
  const [checks, setChecks] = useState<boolean[]>(CRITERIA.map(() => false));
  const [ageModifier, setAgeModifier] = useState<number>(0);


  const result = calcCentor(checks, ageModifier);

  const toggle = (index: number) => {
    setChecks((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {CRITERIA.map((label, i) => (
          <label key={label} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={checks[i]}
              onChange={() => toggle(i)}
              className="rounded"
            />
            <span>{label}</span>
          </label>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Modyfikator wieku (McIsaac)</label>
        <select
          value={ageModifier}
          onChange={(e) => setAgeModifier(Number(e.target.value))}
          className="input-field"
        >
          {AGE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="pt-3 space-y-2" style={{ borderTop: '1px solid var(--bor)' }}>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{result.value}</span>
          <span className="text-sm" style={{ color: 'var(--txm)' }}>pkt</span>
          <span className={`calc-badge ${result.severity}`}>
            {result.stage}
          </span>
        </div>
        <p className="text-sm" style={{ color: 'var(--txm)' }}>{result.interpretation}</p>
      </div>
    </div>
  );
}
