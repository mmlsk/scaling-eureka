'use client';

import { useState } from 'react';
import { calcAPGAR } from '@/lib/calculators/formulas';

interface APGARCategory {
  label: string;
  options: { value: number; label: string }[];
}

const CATEGORIES: APGARCategory[] = [
  {
    label: 'Appearance (zabarwienie)',
    options: [
      { value: 0, label: '0 — Sine / blade' },
      { value: 1, label: '1 — Sinica obwodowa (akrocjanoza)' },
      { value: 2, label: '2 — Całkowicie różowe' },
    ],
  },
  {
    label: 'Pulse (tętno)',
    options: [
      { value: 0, label: '0 — Brak' },
      { value: 1, label: '1 — <100/min' },
      { value: 2, label: '2 — ≥100/min' },
    ],
  },
  {
    label: 'Grimace (odruch)',
    options: [
      { value: 0, label: '0 — Brak reakcji' },
      { value: 1, label: '1 — Grymas' },
      { value: 2, label: '2 — Kaszel / kichanie / płacz' },
    ],
  },
  {
    label: 'Activity (napięcie mięśniowe)',
    options: [
      { value: 0, label: '0 — Wiotkie' },
      { value: 1, label: '1 — Pewne zgięcie' },
      { value: 2, label: '2 — Aktywne ruchy' },
    ],
  },
  {
    label: 'Respiration (oddychanie)',
    options: [
      { value: 0, label: '0 — Brak' },
      { value: 1, label: '1 — Wolne / nieregularne' },
      { value: 2, label: '2 — Mocny płacz' },
    ],
  },
];

export default function APGARCalc() {
  const [scores, setScores] = useState<number[]>(CATEGORIES.map(() => 2));


  const result = calcAPGAR(scores);

  const handleChange = (index: number, value: number) => {
    setScores((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {CATEGORIES.map((cat, i) => (
          <div key={cat.label}>
            <label className="block text-sm font-medium mb-1">{cat.label}</label>
            <select
              value={scores[i]}
              onChange={(e) => handleChange(i, Number(e.target.value))}
              className="input-field"
            >
              {cat.options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="pt-3 space-y-2" style={{ borderTop: '1px solid var(--bor)' }}>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{result.value}</span>
          <span className="text-sm" style={{ color: 'var(--txm)' }}>/ 10 pkt</span>
          <span className={`calc-badge ${result.severity}`}>
            {result.stage}
          </span>
        </div>
        <p className="text-sm" style={{ color: 'var(--txm)' }}>{result.interpretation}</p>
      </div>
    </div>
  );
}
