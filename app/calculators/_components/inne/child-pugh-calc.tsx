'use client';

import { useState } from 'react';
import { calcChildPugh } from '@/lib/calculators/formulas';

interface CPCategory {
  label: string;
  options: { value: number; label: string }[];
}

const CATEGORIES: CPCategory[] = [
  {
    label: 'Bilirubina (mg/dL)',
    options: [
      { value: 1, label: '1 — <2' },
      { value: 2, label: '2 — 2-3' },
      { value: 3, label: '3 — >3' },
    ],
  },
  {
    label: 'Albumina (g/dL)',
    options: [
      { value: 1, label: '1 — >3.5' },
      { value: 2, label: '2 — 2.8-3.5' },
      { value: 3, label: '3 — <2.8' },
    ],
  },
  {
    label: 'INR',
    options: [
      { value: 1, label: '1 — <1.7' },
      { value: 2, label: '2 — 1.7-2.3' },
      { value: 3, label: '3 — >2.3' },
    ],
  },
  {
    label: 'Wodobrzusze (ascites)',
    options: [
      { value: 1, label: '1 — Brak' },
      { value: 2, label: '2 — Niewielkie (kontrolowane)' },
      { value: 3, label: '3 — Umiarkowane-ciężkie (oporne)' },
    ],
  },
  {
    label: 'Encefalopatia',
    options: [
      { value: 1, label: '1 — Brak' },
      { value: 2, label: '2 — Stopień 1-2 (kontrolowana)' },
      { value: 3, label: '3 — Stopień 3-4 (oporna)' },
    ],
  },
];

export default function ChildPughCalc() {
  const [scores, setScores] = useState<number[]>(CATEGORIES.map(() => 1));


  const result = calcChildPugh(scores);

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
          <span className="text-sm" style={{ color: 'var(--txm)' }}>/ 15 pkt</span>
          <span className={`calc-badge ${result.severity}`}>
            {result.stage}
          </span>
        </div>
        <p className="text-sm" style={{ color: 'var(--txm)' }}>{result.interpretation}</p>
      </div>
    </div>
  );
}
