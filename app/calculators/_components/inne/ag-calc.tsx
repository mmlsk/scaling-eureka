'use client';

import { useState } from 'react';
import { calcAnionGap } from '@/lib/calculators/formulas';
import { CALC_VERSIONS, getVersionLabel } from '@/lib/calculators/versions';

export default function AGCalc() {
  const [na, setNa] = useState<number>(140);
  const [cl, setCl] = useState<number>(104);
  const [hco3, setHco3] = useState<number>(24);

  const meta = CALC_VERSIONS['AG'];
  const versionLabel = getVersionLabel('AG');

  const isValid = na > 0 && cl > 0 && hco3 > 0;
  const result = isValid ? calcAnionGap(na, cl, hco3) : null;

  const severityColor =
    result?.severity === 'ok'
      ? 'bg-green-100 text-green-800'
      : result?.severity === 'warn'
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800';

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Anion Gap</h3>
        {versionLabel && (
          <span className="text-xs text-gray-500">{meta.formula} v{meta.version}</span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Na+ (mEq/L)</label>
          <input
            type="number"
            value={na}
            onChange={(e) => setNa(Number(e.target.value))}
            min={100}
            max={180}
            className="w-full rounded border px-2 py-1"
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
            className="w-full rounded border px-2 py-1"
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
            className="w-full rounded border px-2 py-1"
          />
        </div>
      </div>

      {result && (
        <div className="border-t pt-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{result.value}</span>
            <span className="text-sm text-gray-500">mEq/L</span>
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
