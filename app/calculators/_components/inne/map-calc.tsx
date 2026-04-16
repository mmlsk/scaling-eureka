'use client';

import { useState } from 'react';
import { calcMAP } from '@/lib/calculators/formulas';
import { CALC_VERSIONS, getVersionLabel } from '@/lib/calculators/versions';

export default function MAPCalc() {
  const [systolic, setSystolic] = useState<number>(120);
  const [diastolic, setDiastolic] = useState<number>(80);

  const meta = CALC_VERSIONS['MAP'];
  const versionLabel = getVersionLabel('MAP');

  const isValid = systolic > 0 && diastolic > 0;
  const result = isValid ? calcMAP(systolic, diastolic) : null;

  const severityColor =
    result?.severity === 'ok'
      ? 'bg-green-100 text-green-800'
      : result?.severity === 'warn'
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800';

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">MAP</h3>
        {versionLabel && (
          <span className="text-xs text-gray-500">{meta.formula} v{meta.version}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Ciśnienie skurczowe (mmHg)</label>
          <input
            type="number"
            value={systolic}
            onChange={(e) => setSystolic(Number(e.target.value))}
            min={40}
            max={300}
            className="w-full rounded border px-2 py-1"
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
            className="w-full rounded border px-2 py-1"
          />
        </div>
      </div>

      {result && (
        <div className="border-t pt-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{result.value}</span>
            <span className="text-sm text-gray-500">mmHg</span>
            <span className={`ml-auto px-2 py-0.5 rounded text-xs font-medium ${severityColor}`}>
              {result.stage}
            </span>
          </div>
          <p className="text-sm text-gray-600">{result.interpretation}</p>
        </div>
      )}
    </div>
  );
}
