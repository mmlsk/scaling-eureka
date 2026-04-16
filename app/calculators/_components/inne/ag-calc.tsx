'use client';

import { useState } from 'react';
import { calcAnionGap } from '@/lib/calculators/formulas';

export default function AGCalc() {
  const [na, setNa] = useState<number>(140);
  const [cl, setCl] = useState<number>(104);
  const [hco3, setHco3] = useState<number>(24);


  const isValid = na > 0 && cl > 0 && hco3 > 0;
  const result = isValid ? calcAnionGap(na, cl, hco3) : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Na+ (mEq/L)</label>
          <input
            type="number"
            value={na}
            onChange={(e) => setNa(Number(e.target.value))}
            min={100}
            max={180}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cl- (mEq/L)</label>
          <input
            type="number"
            value={cl}
            onChange={(e) => setCl(Number(e.target.value))}
            min={70}
            max={140}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">HCO3- (mEq/L)</label>
          <input
            type="number"
            value={hco3}
            onChange={(e) => setHco3(Number(e.target.value))}
            min={1}
            max={50}
            className="input-field"
          />
        </div>
      </div>

      {result && (
        <div className="pt-3 space-y-2" style={{ borderTop: '1px solid var(--bor)' }}>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{result.value}</span>
            <span className="text-sm" style={{ color: 'var(--txm)' }}>mEq/L</span>
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
