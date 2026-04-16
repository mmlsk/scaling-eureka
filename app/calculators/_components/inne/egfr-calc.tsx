'use client';

import { useState } from 'react';
import { calcEGFR } from '@/lib/calculators/formulas';
import { CALC_VERSIONS, getVersionLabel } from '@/lib/calculators/versions';

export default function EGFRCalc() {
  const [creatinine, setCreatinine] = useState<number>(1.0);
  const [age, setAge] = useState<number>(50);
  const [sex, setSex] = useState<'M' | 'F'>('M');

  const meta = CALC_VERSIONS['eGFR'];
  const versionLabel = getVersionLabel('eGFR');

  const isValid = creatinine > 0 && age > 0;
  const result = isValid ? calcEGFR(creatinine, age, sex) : null;

  const severityColor =
    result?.severity === 'ok'
      ? 'bg-green-100 text-green-800'
      : result?.severity === 'warn'
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800';

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">eGFR (CKD-EPI 2021)</h3>
        {versionLabel && (
          <span className="text-xs text-gray-500">{meta.formula} v{meta.version}</span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Kreatynina (mg/dL)</label>
          <input
            type="number"
            value={creatinine}
            onChange={(e) => setCreatinine(Number(e.target.value))}
            step={0.1}
            min={0.1}
            max={30}
            className="w-full rounded border px-2 py-1"
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
            className="w-full rounded border px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Płeć</label>
          <select
            value={sex}
            onChange={(e) => setSex(e.target.value as 'M' | 'F')}
            className="w-full rounded border px-2 py-1"
          >
            <option value="M">Mężczyzna</option>
            <option value="F">Kobieta</option>
          </select>
        </div>
      </div>

      {result && (
        <div className="border-t pt-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{result.value}</span>
            <span className="text-sm text-gray-500">mL/min/1.73m&#xB2;</span>
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
