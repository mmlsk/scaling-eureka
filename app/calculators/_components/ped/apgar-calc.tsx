'use client';

import { useState } from 'react';
import { calcAPGAR } from '@/lib/calculators/formulas';
import { CALC_VERSIONS, getVersionLabel } from '@/lib/calculators/versions';

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

  const meta = CALC_VERSIONS['APGAR'];
  const versionLabel = getVersionLabel('APGAR');

  const result = calcAPGAR(scores);

  const handleChange = (index: number, value: number) => {
    setScores((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const severityColor =
    result.severity === 'ok'
      ? 'bg-green-100 text-green-800'
      : result.severity === 'warn'
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800';

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">APGAR Score</h3>
        {versionLabel && (
          <span className="text-xs text-gray-500">{meta.formula} v{meta.version}</span>
        )}
      </div>

      <div className="space-y-3">
        {CATEGORIES.map((cat, i) => (
          <div key={cat.label}>
            <label className="block text-sm font-medium mb-1">{cat.label}</label>
            <select
              value={scores[i]}
              onChange={(e) => handleChange(i, Number(e.target.value))}
              className="w-full rounded border px-2 py-1 text-sm"
            >
              {cat.options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="border-t pt-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{result.value}</span>
          <span className="text-sm text-gray-500">/ 10 pkt</span>
          <span className={`ml-auto px-2 py-0.5 rounded text-xs font-medium ${severityColor}`}>
            {result.stage}
          </span>
        </div>
        <p className="text-sm text-gray-600">{result.interpretation}</p>
      </div>
    </div>
  );
}
