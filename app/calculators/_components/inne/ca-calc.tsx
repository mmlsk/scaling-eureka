'use client';

import { useState } from 'react';
import { calcCorrectedCa } from '@/lib/calculators/formulas';
import { CALC_VERSIONS, getVersionLabel } from '@/lib/calculators/versions';

export default function CaCalc() {
  const [totalCa, setTotalCa] = useState<number>(9.0);
  const [albumin, setAlbumin] = useState<number>(4.0);

  const meta = CALC_VERSIONS['Ca-corr'];
  const versionLabel = getVersionLabel('Ca-corr');

  const isValid = totalCa > 0 && albumin > 0;
  const result = isValid ? calcCorrectedCa(totalCa, albumin) : null;

  const severityColor =
    result?.severity === 'ok'
      ? 'bg-green-100 text-green-800'
      : result?.severity === 'warn'
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800';

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Corrected Ca</h3>
        {versionLabel && (
          <span className="text-xs text-gray-500">{meta.formula} v{meta.version}</span>
        )}
      </div>

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
            className="w-full rounded border px-2 py-1"
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
            className="w-full rounded border px-2 py-1"
          />
        </div>
      </div>

      {result && (
        <div className="border-t pt-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{result.value}</span>
            <span className="text-sm text-gray-500">mg/dL</span>
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
