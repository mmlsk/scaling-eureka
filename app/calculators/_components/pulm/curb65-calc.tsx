'use client';

import { useState } from 'react';
import { calcCURB65 } from '@/lib/calculators/formulas';
import { CALC_VERSIONS, getVersionLabel } from '@/lib/calculators/versions';

const CRITERIA = [
  'Confusion (splątanie)',
  'Urea > 7 mmol/L (BUN > 19 mg/dL)',
  'Respiratory rate ≥ 30/min',
  'Blood pressure (SBP <90 lub DBP ≤60)',
  'Wiek ≥ 65 lat',
];

export default function CURB65Calc() {
  const [checks, setChecks] = useState<boolean[]>(CRITERIA.map(() => false));

  const meta = CALC_VERSIONS['CURB-65'];
  const versionLabel = getVersionLabel('CURB-65');

  const result = calcCURB65(checks);

  const toggle = (index: number) => {
    setChecks((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const severityColor =
    result.severity === 'ok'
      ? 'bg-green-100 text-green-800'
      : result.severity === 'warn'
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800';

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">CURB-65</h3>
        {versionLabel && (
          <span className="text-xs text-gray-500">{meta.formula} v{meta.version}</span>
        )}
      </div>

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

      <div className="border-t pt-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{result.value}</span>
          <span className="text-sm text-gray-500">/ 5 pkt</span>
          <span className={`ml-auto px-2 py-0.5 rounded text-xs font-medium ${severityColor}`}>
            {result.stage}
          </span>
        </div>
        <p className="text-sm text-gray-600">{result.interpretation}</p>
      </div>
    </div>
  );
}
