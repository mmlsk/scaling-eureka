'use client';

import { useState } from 'react';
import { calcMELDNa } from '@/lib/calculators/formulas';

export default function MELDCalc() {
  const [bilirubin, setBilirubin] = useState<number>(1.0);
  const [inr, setInr] = useState<number>(1.0);
  const [creatinine, setCreatinine] = useState<number>(1.0);
  const [sodium, setSodium] = useState<number>(140);
  const [dialysis, setDialysis] = useState(false);


  const isValid = bilirubin > 0 && inr > 0 && creatinine > 0 && sodium > 0;
  const result = isValid ? calcMELDNa(bilirubin, inr, creatinine, sodium, dialysis) : null;

  return (
    <div className="space-y-4">
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
            className="input-field"
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
            className="input-field"
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
            className="input-field"
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
            className="input-field"
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
        <div className="pt-3 space-y-2" style={{ borderTop: '1px solid var(--bor)' }}>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{result.value}</span>
            <span className="text-sm" style={{ color: 'var(--txm)' }}>pkt</span>
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
