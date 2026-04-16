'use client';

import { useState } from 'react';
import { calcNEWS2, type NEWS2Input } from '@/lib/calculators/formulas';
import { CALC_VERSIONS, getVersionLabel } from '@/lib/calculators/versions';

interface SelectCategory {
  key: keyof Omit<NEWS2Input, 'copd' | 'supplementalO2'>;
  label: string;
  options: { value: number; label: string }[];
}

const SELECTS: SelectCategory[] = [
  {
    key: 'rr',
    label: 'Częstość oddechów',
    options: [
      { value: 3, label: '3 — ≤8 lub ≥25' },
      { value: 2, label: '2 — 9-11' },
      { value: 1, label: '1 — 12-20' },
      { value: 0, label: '0 — 12-20 (norma)' },
    ],
  },
  {
    key: 'spo2',
    label: 'SpO2 (%)',
    options: [
      { value: 3, label: '3 — ≤91%' },
      { value: 2, label: '2 — 92-93%' },
      { value: 1, label: '1 — 94-95%' },
      { value: 0, label: '0 — ≥96%' },
    ],
  },
  {
    key: 'temp',
    label: 'Temperatura',
    options: [
      { value: 3, label: '3 — ≤35.0°C' },
      { value: 2, label: '2 — 35.1-36.0°C' },
      { value: 1, label: '1 — 36.1-38.0°C lub 38.1-39.0°C' },
      { value: 0, label: '0 — 36.1-38.0°C (norma)' },
    ],
  },
  {
    key: 'sbp',
    label: 'Ciśnienie skurczowe (SBP)',
    options: [
      { value: 3, label: '3 — ≤90 lub ≥220 mmHg' },
      { value: 2, label: '2 — 91-100 mmHg' },
      { value: 1, label: '1 — 101-110 mmHg' },
      { value: 0, label: '0 — 111-219 mmHg' },
    ],
  },
  {
    key: 'hr',
    label: 'Tętno (HR)',
    options: [
      { value: 3, label: '3 — ≤40 lub ≥131 bpm' },
      { value: 2, label: '2 — 41-50 lub 111-130 bpm' },
      { value: 1, label: '1 — 51-90 lub 91-110 bpm' },
      { value: 0, label: '0 — 51-90 bpm (norma)' },
    ],
  },
  {
    key: 'avpu',
    label: 'Poziom świadomości (AVPU)',
    options: [
      { value: 0, label: '0 — Alert (przytomny)' },
      { value: 3, label: '3 — Voice / Pain / Unresponsive' },
    ],
  },
];

export default function NEWS2Calc() {
  const [input, setInput] = useState<NEWS2Input>({
    rr: 0,
    spo2: 0,
    copd: false,
    supplementalO2: false,
    temp: 0,
    sbp: 0,
    hr: 0,
    avpu: 0,
  });

  const meta = CALC_VERSIONS['NEWS2'];
  const versionLabel = getVersionLabel('NEWS2');

  const result = calcNEWS2(input);

  const handleSelect = (key: keyof Omit<NEWS2Input, 'copd' | 'supplementalO2'>, value: number) => {
    setInput((prev) => ({ ...prev, [key]: value }));
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
        <h3 className="text-lg font-semibold">NEWS2</h3>
        {versionLabel && (
          <span className="text-xs text-gray-500">{meta.formula} v{meta.version}</span>
        )}
      </div>

      <div className="space-y-3">
        {SELECTS.map((cat) => (
          <div key={cat.key}>
            <label className="block text-sm font-medium mb-1">{cat.label}</label>
            <select
              value={input[cat.key]}
              onChange={(e) => handleSelect(cat.key, Number(e.target.value))}
              className="w-full rounded border px-2 py-1 text-sm"
            >
              {cat.options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        ))}

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={input.supplementalO2}
            onChange={() => setInput((prev) => ({ ...prev, supplementalO2: !prev.supplementalO2 }))}
            className="rounded"
          />
          <span className="text-sm">Tlenoterapia (+2)</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={input.copd}
            onChange={() => setInput((prev) => ({ ...prev, copd: !prev.copd }))}
            className="rounded"
          />
          <span className="text-sm">POChP (skala SpO2 2)</span>
        </label>
      </div>

      <div className="border-t pt-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{result.value}</span>
          <span className="text-sm text-gray-500">pkt</span>
          <span className={`ml-auto px-2 py-0.5 rounded text-xs font-medium ${severityColor}`}>
            {result.stage}
          </span>
        </div>
        <p className="text-sm text-gray-600">{result.interpretation}</p>
      </div>
    </div>
  );
}
