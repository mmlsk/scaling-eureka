'use client';

import { useState } from 'react';
import { calcABCD2, type ABCD2Input } from '@/lib/calculators/formulas';
import { CALC_VERSIONS, getVersionLabel } from '@/lib/calculators/versions';

interface CheckItem {
  key: keyof ABCD2Input;
  label: string;
  points: string;
  group?: string;
}

const ITEMS: CheckItem[] = [
  { key: 'age60', label: 'Wiek ≥60 lat', points: '+1' },
  { key: 'bpHigh', label: 'BP ≥140/90 mmHg', points: '+1' },
  { key: 'clinicalUnilateral', label: 'Jednostronny niedowład', points: '+2', group: 'clinical' },
  { key: 'clinicalSpeech', label: 'Zaburzenia mowy bez niedowładu', points: '+1', group: 'clinical' },
  { key: 'duration60', label: 'Czas trwania ≥60 min', points: '+2', group: 'duration' },
  { key: 'duration10to59', label: 'Czas trwania 10-59 min', points: '+1', group: 'duration' },
  { key: 'diabetes', label: 'Cukrzyca', points: '+1' },
];

export default function ABCD2Calc() {
  const [input, setInput] = useState<ABCD2Input>({
    age60: false,
    bpHigh: false,
    clinicalUnilateral: false,
    clinicalSpeech: false,
    duration60: false,
    duration10to59: false,
    diabetes: false,
  });

  const result = calcABCD2(input);

  const toggle = (key: keyof ABCD2Input) => {
    setInput((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // Mutual exclusion for clinical group
      if (key === 'clinicalUnilateral' && next.clinicalUnilateral) {
        next.clinicalSpeech = false;
      }
      if (key === 'clinicalSpeech' && next.clinicalSpeech) {
        next.clinicalUnilateral = false;
      }
      // Mutual exclusion for duration group
      if (key === 'duration60' && next.duration60) {
        next.duration10to59 = false;
      }
      if (key === 'duration10to59' && next.duration10to59) {
        next.duration60 = false;
      }
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
        <h3 className="text-lg font-semibold">ABCD&#xB2; Score</h3>
        <span className="text-xs text-gray-500">TIA risk stratification</span>
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
          <span className="text-sm text-gray-500">/ 7 pkt</span>
          <span className={`ml-auto px-2 py-0.5 rounded text-xs font-medium ${severityColor}`}>
            {result.stage}
          </span>
        </div>
        <p className="text-sm text-gray-600">{result.interpretation}</p>
      </div>
    </div>
  );
}
