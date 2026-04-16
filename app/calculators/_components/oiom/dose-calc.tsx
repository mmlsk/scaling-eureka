'use client';

import { useState } from 'react';
import { calcDose } from '@/lib/calculators/formulas';
import { CALC_VERSIONS, getVersionLabel } from '@/lib/calculators/versions';

export default function DoseCalc() {
  const [weight, setWeight] = useState<number>(70);
  const [mgkg, setMgkg] = useState<string>('');
  const [mcgkgmin, setMcgkgmin] = useState<string>('');
  const [concentration, setConcentration] = useState<string>('');

  const meta = CALC_VERSIONS['Dose'];
  const versionLabel = getVersionLabel('Dose');

  const result = calcDose(
    weight,
    mgkg ? Number(mgkg) : undefined,
    mcgkgmin ? Number(mcgkgmin) : undefined,
    concentration ? Number(concentration) : undefined,
  );

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Kalkulator dawkowania</h3>
        {versionLabel && (
          <span className="text-xs text-gray-500">{meta.formula} v{meta.version}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Masa ciała (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            min={1}
            max={500}
            className="w-full rounded border px-2 py-1"
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
            className="w-full rounded border px-2 py-1"
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
            className="w-full rounded border px-2 py-1"
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
            className="w-full rounded border px-2 py-1"
          />
        </div>
      </div>

      <div className="border-t pt-3 space-y-1">
        {result.lines.map((line, i) => (
          <p key={i} className="text-sm text-gray-700 font-mono">{line}</p>
        ))}
      </div>
    </div>
  );
}
