'use client';

import { useState } from 'react';
import { calcChildPugh } from '@/lib/calculators/formulas';
import { CALC_VERSIONS, getVersionLabel } from '@/lib/calculators/versions';

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

  const meta = CALC_VERSIONS['Child-Pugh'];
  const versionLabel = getVersionLabel('Child-Pugh');

  const result = calcChildPugh(scores);

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
        <h3 className="text-lg font-semibold">Child-Pugh</h3>
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
          <span className="text-sm text-gray-500">/ 15 pkt</span>
          <span className={`ml-auto px-2 py-0.5 rounded text-xs font-medium ${severityColor}`}>
            {result.stage}
          </span>
        </div>
        <p className="text-sm text-gray-600">{result.interpretation}</p>
      </div>
    </div>
  );
}
