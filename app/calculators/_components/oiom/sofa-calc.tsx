'use client';

import { useState } from 'react';
import { calcSOFA } from '@/lib/calculators/formulas';
import { CALC_VERSIONS, getVersionLabel } from '@/lib/calculators/versions';

interface SOFACategory {
  label: string;
  options: { value: number; label: string }[];
}

const CATEGORIES: SOFACategory[] = [
  {
    label: 'Oddychanie (PaO2/FiO2)',
    options: [
      { value: 0, label: '0 — ≥400' },
      { value: 1, label: '1 — <400' },
      { value: 2, label: '2 — <300' },
      { value: 3, label: '3 — <200 z wentylacją' },
      { value: 4, label: '4 — <100 z wentylacją' },
    ],
  },
  {
    label: 'Płytki krwi (x10^3/uL)',
    options: [
      { value: 0, label: '0 — ≥150' },
      { value: 1, label: '1 — <150' },
      { value: 2, label: '2 — <100' },
      { value: 3, label: '3 — <50' },
      { value: 4, label: '4 — <20' },
    ],
  },
  {
    label: 'Bilirubina (mg/dL)',
    options: [
      { value: 0, label: '0 — <1.2' },
      { value: 1, label: '1 — 1.2-1.9' },
      { value: 2, label: '2 — 2.0-5.9' },
      { value: 3, label: '3 — 6.0-11.9' },
      { value: 4, label: '4 — ≥12.0' },
    ],
  },
  {
    label: 'Układ sercowo-naczyniowy',
    options: [
      { value: 0, label: '0 — MAP ≥70 mmHg' },
      { value: 1, label: '1 — MAP <70 mmHg' },
      { value: 2, label: '2 — Dopamina ≤5 lub dobutamina' },
      { value: 3, label: '3 — Dopa >5 lub NA/A ≤0.1' },
      { value: 4, label: '4 — Dopa >15 lub NA/A >0.1' },
    ],
  },
  {
    label: 'GCS',
    options: [
      { value: 0, label: '0 — 15' },
      { value: 1, label: '1 — 13-14' },
      { value: 2, label: '2 — 10-12' },
      { value: 3, label: '3 — 6-9' },
      { value: 4, label: '4 — <6' },
    ],
  },
  {
    label: 'Kreatynina (mg/dL) / diureza',
    options: [
      { value: 0, label: '0 — <1.2' },
      { value: 1, label: '1 — 1.2-1.9' },
      { value: 2, label: '2 — 2.0-3.4' },
      { value: 3, label: '3 — 3.5-4.9 lub <500mL/d' },
      { value: 4, label: '4 — ≥5.0 lub <200mL/d' },
    ],
  },
];

export default function SOFACalc() {
  const [scores, setScores] = useState<number[]>(CATEGORIES.map(() => 0));

  const meta = CALC_VERSIONS['SOFA'];
  const versionLabel = getVersionLabel('SOFA');

  const result = calcSOFA(scores);

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
        <h3 className="text-lg font-semibold">SOFA Score</h3>
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
          <span className="text-sm text-gray-500">/ 24 pkt</span>
          <span className={`ml-auto px-2 py-0.5 rounded text-xs font-medium ${severityColor}`}>
            {result.stage}
          </span>
        </div>
        <p className="text-sm text-gray-600">{result.interpretation}</p>
      </div>
    </div>
  );
}
