'use client';

import { useState } from 'react';
import { calcPERC } from '@/lib/calculators/formulas';

const CRITERIA = [
  'Wiek <50 lat',
  'HR <100/min',
  'SpO2 >94%',
  'Brak jednostronnego obrzęku kończyny dolnej',
  'Brak krwioplucia',
  'Brak operacji/urazu w ciągu 4 tyg.',
  'Brak DVT/PE w wywiadzie',
  'Brak terapii estrogenowej',
];

export default function PERCCalc() {
  const [checks, setChecks] = useState<boolean[]>(CRITERIA.map(() => true));


  const result = calcPERC(checks);

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
            <span className="text-sm">{label}</span>
          </label>
        ))}
      </div>

      <div className="pt-3 space-y-2" style={{ borderTop: '1px solid var(--bor)' }}>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{result.value}</span>
          <span className="text-sm" style={{ color: 'var(--txm)' }}>kryteriów</span>
          <span className={`calc-badge ${result.severity}`}>
            {result.stage}
          </span>
        </div>
        <p className="text-sm" style={{ color: 'var(--txm)' }}>{result.interpretation}</p>
      </div>
    </div>
  );
}
