'use client';

import { useState } from 'react';
import { calcWellsPE } from '@/lib/calculators/formulas';

const CRITERIA = [
  'Objawy kliniczne DVT',
  'PE bardziej prawdopodobna niż inne rozpoznanie',
  'Tachykardia HR >100/min',
  'Unieruchomienie / operacja w ciągu 4 tyg.',
  'DVT/PE w wywiadzie',
  'Krwioplucie',
  'Aktywny nowotwór (leczenie w ciągu 6 mies.)',
];

export default function WellsPECalc() {
  const [checks, setChecks] = useState<boolean[]>(CRITERIA.map(() => false));


  const result = calcWellsPE(checks);

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
