'use client';

import { useState } from 'react';
import { calcCURB65 } from '@/lib/calculators/formulas';

const CRITERIA = [
  'Confusion (splątanie)',
  'Urea > 7 mmol/L (BUN > 19 mg/dL)',
  'Respiratory rate ≥ 30/min',
  'Blood pressure (SBP <90 lub DBP ≤60)',
  'Wiek ≥ 65 lat',
];

export default function CURB65Calc() {
  const [checks, setChecks] = useState<boolean[]>(CRITERIA.map(() => false));


  const result = calcCURB65(checks);

  const toggle = (index: number) => {
    setChecks((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {CRITERIA.map((label, i) => (
          <label key={label} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={checks[i]}
              onChange={() => toggle(i)}
              className="rounded"
            />
            <span>{label}</span>
          </label>
        ))}
      </div>

      <div className="pt-3 space-y-2" style={{ borderTop: '1px solid var(--bor)' }}>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{result.value}</span>
          <span className="text-sm" style={{ color: 'var(--txm)' }}>/ 5 pkt</span>
          <span className={`calc-badge ${result.severity}`}>
            {result.stage}
          </span>
        </div>
        <p className="text-sm" style={{ color: 'var(--txm)' }}>{result.interpretation}</p>
      </div>
    </div>
  );
}
