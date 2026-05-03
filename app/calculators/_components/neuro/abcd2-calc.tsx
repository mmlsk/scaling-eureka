'use client';

import { useState } from 'react';
import type { ABCD2Input } from '@/lib/calculators/formulas';
import { calcABCD2 } from '@/lib/calculators/formulas';

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
          <span className="text-sm" style={{ color: 'var(--txm)' }}>/ 7 pkt</span>
          <span className={`calc-badge ${result.severity}`}>
            {result.stage}
          </span>
        </div>
        <p className="text-sm" style={{ color: 'var(--txm)' }}>{result.interpretation}</p>
      </div>
    </div>
  );
}
