'use client';

import { useState } from 'react';
import { calcCHADS, type CHADSInput } from '@/lib/calculators/formulas';

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

  const toggle = (key: keyof CHADSInput) => {
    setInput((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-4">
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
            <span className="text-xs" style={{ color: 'var(--txm)' }}>{item.points}</span>
          </label>
        ))}
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
