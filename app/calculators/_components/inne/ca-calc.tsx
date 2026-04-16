'use client';

import { useState } from 'react';
import { calcCorrectedCa } from '@/lib/calculators/formulas';

export default function CaCalc() {
  const [totalCa, setTotalCa] = useState<number>(9.0);
  const [albumin, setAlbumin] = useState<number>(4.0);


  const isValid = totalCa > 0 && albumin > 0;
  const result = isValid ? calcCorrectedCa(totalCa, albumin) : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Ca całkowite (mg/dL)</label>
          <input
            type="number"
            value={totalCa}
            onChange={(e) => setTotalCa(Number(e.target.value))}
            step={0.1}
            min={1}
            max={20}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Albumina (g/dL)</label>
          <input
            type="number"
            value={albumin}
            onChange={(e) => setAlbumin(Number(e.target.value))}
            step={0.1}
            min={0.5}
            max={6}
            className="input-field"
          />
        </div>
      </div>

      {result && (
        <div className="pt-3 space-y-2" style={{ borderTop: '1px solid var(--bor)' }}>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{result.value}</span>
            <span className="text-sm" style={{ color: 'var(--txm)' }}>mg/dL</span>
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
