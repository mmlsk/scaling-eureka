'use client';

import { useState } from 'react';
import { calcQTc } from '@/lib/calculators/formulas';

export default function QTcCalc() {
  const [qt, setQt] = useState<number>(400);
  const [hr, setHr] = useState<number>(70);


  const isValid = qt > 0 && hr > 0;
  const result = isValid ? calcQTc(qt, hr) : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">QT interval (ms)</label>
          <input
            type="number"
            value={qt}
            onChange={(e) => setQt(Number(e.target.value))}
            min={100}
            max={800}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">HR (bpm)</label>
          <input
            type="number"
            value={hr}
            onChange={(e) => setHr(Number(e.target.value))}
            min={20}
            max={300}
            className="input-field"
          />
        </div>
      </div>

      {result && (
        <div className="pt-3 space-y-2" style={{ borderTop: '1px solid var(--bor)' }}>
          <div className="flex items-center gap-2">
            <span className={`calc-badge ${result.severity}`}>
              {result.level}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xs" style={{ color: 'var(--txm)' }}>Bazett</div>
              <div className="text-xl font-bold">{result.bazett}</div>
              <div className="text-xs" style={{ color: 'var(--txm)' }}>ms</div>
            </div>
            <div>
              <div className="text-xs" style={{ color: 'var(--txm)' }}>Fridericia</div>
              <div className="text-xl font-bold">{result.fridericia}</div>
              <div className="text-xs" style={{ color: 'var(--txm)' }}>ms</div>
            </div>
            <div>
              <div className="text-xs" style={{ color: 'var(--txm)' }}>Framingham</div>
              <div className="text-xl font-bold">{result.framingham}</div>
              <div className="text-xs" style={{ color: 'var(--txm)' }}>ms</div>
            </div>
          </div>
          <p className="text-sm" style={{ color: 'var(--txm)' }}>{result.interpretation}</p>
        </div>
      )}
    </div>
  );
}
