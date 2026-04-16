'use client';

import { useState } from 'react';
import { calcMELDNa } from '@/lib/calculators/formulas';
import { CALC_VERSIONS, getVersionLabel } from '@/lib/calculators/versions';

export default function MELDCalc() {
  const [bilirubin, setBilirubin] = useState<number>(1.0);
  const [inr, setInr] = useState<number>(1.0);
  const [creatinine, setCreatinine] = useState<number>(1.0);
  const [sodium, setSodium] = useState<number>(140);
  const [dialysis, setDialysis] = useState(false);

  const meta = CALC_VERSIONS['MELD-Na'];
  const versionLabel = getVersionLabel('MELD-Na');

  const isValid = bilirubin > 0 && inr > 0 && creatinine > 0 && sodium > 0;
  const result = isValid ? calcMELDNa(bilirubin, inr, creatinine, sodium, dialysis) : null;

  const severityColor =
    result?.severity === 'ok'
      ? 'bg-green-100 text-green-800'
      : result?.severity === 'warn'
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800';

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">MELD-Na</h3>
        {versionLabel && (
          <span className="text-xs text-gray-500">{meta.formula} v{meta.version}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Bilirubina (mg/dL)</label>
          <input
            type="number"
            value={bilirubin}
            onChange={(e) => setBilirubin(Number(e.target.value))}
            step={0.1}
            min={0.1}
            max={50}
            className="w-full rounded border px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">INR</label>
          <input
            type="number"
            value={inr}
            onChange={(e) => setInr(Number(e.target.value))}
            step={0.1}
            min={0.5}
            max={20}
            className="w-full rounded border px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Kreatynina (mg/dL)</label>
          <input
            type="number"
            value={creatinine}
            onChange={(e) => setCreatinine(Number(e.target.value))}
            step={0.1}
            min={0.1}
            max={15}
            className="w-full rounded border px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Na+ (mEq/L)</label>
          <input
            type="number"
            value={sodium}
            onChange={(e) => setSodium(Number(e.target.value))}
            min={100}
            max={180}
            className="w-full rounded border px-2 py-1"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={dialysis}
          onChange={() => setDialysis((v) => !v)}
          className="rounded"
        />
        <span className="text-sm">Dializa (Cr = 4.0)</span>
      </label>

      {result && (
        <div className="border-t pt-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{result.value}</span>
            <span className="text-sm text-gray-500">pkt</span>
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
