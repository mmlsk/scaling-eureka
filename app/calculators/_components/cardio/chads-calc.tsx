'use client';

import { useState } from 'react';
import { calcCHADS, type CHADSInput } from '@/lib/calculators/formulas';
import { CALC_VERSIONS, getVersionLabel } from '@/lib/calculators/versions';

interface CheckboxItem {
  key: keyof CHADSInput;
  label: string;
  points: string;
}

const ITEMS: CheckboxItem[] = [
  { key: 'chf', label: 'Niewydolność serca (CHF)', points: '+1' },
  { key: 'htn', label: 'Nadciśnienie tętnicze (HTN)', points: '+1' },
  { key: 'age75', label: 'Wiek ≥75 lat', points: '+2' },
  { key: 'dm', label: 'Cukrzyca (DM)', points: '+1' },
  { key: 'stroke', label: 'Udar / TIA w wywiadzie', points: '+2' },
  { key: 'vasc', label: 'Choroba naczyniowa', points: '+1' },
  { key: 'age6574', label: 'Wiek 65-74 lat', points: '+1' },
  { key: 'female', label: 'Płeć żeńska', points: '+1' },
];

export default function CHADSCalc() {
  const [input, setInput] = useState<CHADSInput>({
    chf: false,
    htn: false,
    age75: false,
    dm: false,
    stroke: false,
    vasc: false,
    age6574: false,
    female: false,
  });

  const result = calcCHADS(input);
  const versionLabel = getVersionLabel('CHADS');
  const meta = CALC_VERSIONS['CHADS'];

  const toggle = (key: keyof CHADSInput) => {
    setInput((prev) => ({ ...prev, [key]: !prev[key] }));
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
        <h3 className="text-lg font-semibold">CHA&#x2082;DS&#x2082;-VASc</h3>
        {versionLabel && (
          <span className="text-xs text-gray-500">{meta.formula} v{meta.version}</span>
        )}
      </div>

      <div className="space-y-2">
        {ITEMS.map((item) => (
          <label key={item.key} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={input[item.key]}
              onChange={() => toggle(item.key)}
              className="rounded"
            />
            <span className="flex-1">{item.label}</span>
            <span className="text-xs text-gray-400">{item.points}</span>
          </label>
        ))}
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
