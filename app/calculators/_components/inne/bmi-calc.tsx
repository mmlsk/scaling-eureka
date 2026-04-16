'use client';

import { useState } from 'react';
import { calcBMI } from '@/lib/calculators/formulas';

export default function BMICalc() {
  const [weight, setWeight] = useState<number>(70);
  const [height, setHeight] = useState<number>(175);


  const isValid = weight > 0 && height > 0;
  const result = isValid ? calcBMI(weight, height) : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Masa ciała (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            min={1}
            max={500}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Wzrost (cm)</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            min={30}
            max={300}
            className="input-field"
          />
        </div>
      </div>

      {result && (
        <div className="pt-3 space-y-2" style={{ borderTop: '1px solid var(--bor)' }}>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{result.value}</span>
            <span className="text-sm" style={{ color: 'var(--txm)' }}>kg/m&#xB2;</span>
            <span className={`calc-badge ${result.severity}`}>
              {result.stage}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">{result.bsa}</span>
            <span className="text-sm" style={{ color: 'var(--txm)' }}>m&#xB2; BSA</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--txm)' }}>{result.interpretation}</p>
        </div>
      )}
    </div>
  );
}
