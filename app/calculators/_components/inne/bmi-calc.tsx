'use client';

import { useState } from 'react';
import { calcBMI } from '@/lib/calculators/formulas';
import { CALC_VERSIONS, getVersionLabel } from '@/lib/calculators/versions';

export default function BMICalc() {
  const [weight, setWeight] = useState<number>(70);
  const [height, setHeight] = useState<number>(175);

  const meta = CALC_VERSIONS['BMI'];
  const versionLabel = getVersionLabel('BMI');

  const isValid = weight > 0 && height > 0;
  const result = isValid ? calcBMI(weight, height) : null;

  const severityColor =
    result?.severity === 'ok'
      ? 'bg-green-100 text-green-800'
      : result?.severity === 'warn'
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800';

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">BMI + BSA</h3>
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
          <label className="block text-sm font-medium mb-1">Wzrost (cm)</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            min={30}
            max={300}
            className="w-full rounded border px-2 py-1"
          />
        </div>
      </div>

      {result && (
        <div className="border-t pt-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{result.value}</span>
            <span className="text-sm text-gray-500">kg/m&#xB2;</span>
            <span className={`ml-auto px-2 py-0.5 rounded text-xs font-medium ${severityColor}`}>
              {result.stage}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">{result.bsa}</span>
            <span className="text-sm text-gray-500">m&#xB2; BSA</span>
          </div>
          <p className="text-sm text-gray-600">{result.interpretation}</p>
        </div>
      )}
    </div>
  );
}
