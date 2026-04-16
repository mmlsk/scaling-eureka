'use client';

import { useState } from 'react';
import { calcCG } from '@/lib/calculators/formulas';

export default function CGCalc() {
  const [creatinine, setCreatinine] = useState<number>(1.0);
  const [age, setAge] = useState<number>(50);
  const [weight, setWeight] = useState<number>(70);
  const [sex, setSex] = useState<'M' | 'F'>('M');


  const isValid = creatinine > 0 && age > 0 && weight > 0;
  const result = isValid ? calcCG(creatinine, age, weight, sex) : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Kreatynina (mg/dL)</label>
          <input
            type="number"
            value={creatinine}
            onChange={(e) => setCreatinine(Number(e.target.value))}
            step={0.1}
            min={0.1}
            max={30}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Wiek (lata)</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            min={18}
            max={120}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Masa ciała (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            min={20}
            max={300}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Płeć</label>
          <select
            value={sex}
            onChange={(e) => setSex(e.target.value as 'M' | 'F')}
            className="input-field"
          >
            <option value="M">Mężczyzna</option>
            <option value="F">Kobieta</option>
          </select>
        </div>
      </div>

      {result && (
        <div className="pt-3 space-y-2" style={{ borderTop: '1px solid var(--bor)' }}>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{result.value}</span>
            <span className="text-sm" style={{ color: 'var(--txm)' }}>mL/min</span>
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
