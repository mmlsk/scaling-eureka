'use client';

import { useState } from 'react';
import { calcMAP } from '@/lib/calculators/formulas';

export default function MAPCalc() {
  const [systolic, setSystolic] = useState<number>(120);
  const [diastolic, setDiastolic] = useState<number>(80);


  const isValid = systolic > 0 && diastolic > 0;
  const result = isValid ? calcMAP(systolic, diastolic) : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Ciśnienie skurczowe (mmHg)</label>
          <input
            type="number"
            value={systolic}
            onChange={(e) => setSystolic(Number(e.target.value))}
            min={40}
            max={300}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ciśnienie rozkurczowe (mmHg)</label>
          <input
            type="number"
            value={diastolic}
            onChange={(e) => setDiastolic(Number(e.target.value))}
            min={20}
            max={200}
            className="input-field"
          />
        </div>
      </div>

      {result && (
        <div className="pt-3 space-y-2" style={{ borderTop: '1px solid var(--bor)' }}>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{result.value}</span>
            <span className="text-sm" style={{ color: 'var(--txm)' }}>mmHg</span>
            <span className={`calc-badge ${result.severity}`}>
              {result.stage}
            </span>
          </div>
          <p className="text-sm" style={{ color: 'var(--txm)' }}>{result.interpretation}</p>
        </div>
      )}
    </div>
  );
}
