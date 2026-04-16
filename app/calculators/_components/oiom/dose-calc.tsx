'use client';

import { useState } from 'react';
import { calcDose } from '@/lib/calculators/formulas';

export default function DoseCalc() {
  const [weight, setWeight] = useState<number>(70);
  const [mgkg, setMgkg] = useState<string>('');
  const [mcgkgmin, setMcgkgmin] = useState<string>('');
  const [concentration, setConcentration] = useState<string>('');


  const result = calcDose(
    weight,
    mgkg ? Number(mgkg) : undefined,
    mcgkgmin ? Number(mcgkgmin) : undefined,
    concentration ? Number(concentration) : undefined,
  );

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
          <label className="block text-sm font-medium mb-1">mg/kg (jednorazowo)</label>
          <input
            type="number"
            value={mgkg}
            onChange={(e) => setMgkg(e.target.value)}
            placeholder="np. 10"
            step={0.1}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">mcg/kg/min (wlew)</label>
          <input
            type="number"
            value={mcgkgmin}
            onChange={(e) => setMcgkgmin(e.target.value)}
            placeholder="np. 5"
            step={0.1}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Stężenie (mg/mL)</label>
          <input
            type="number"
            value={concentration}
            onChange={(e) => setConcentration(e.target.value)}
            placeholder="opcjonalnie"
            step={0.01}
            className="input-field"
          />
        </div>
      </div>

      <div className="pt-3 space-y-1" style={{ borderTop: '1px solid var(--bor)' }}>
        {result.lines.map((line, i) => (
          <p key={i} className="text-sm font-mono" style={{ color: 'var(--tx)' }}>{line}</p>
        ))}
      </div>
    </div>
  );
}
