'use client';

import { useState } from 'react';
import { calcQTc } from '@/lib/calculators/formulas';
import { CALC_VERSIONS, getVersionLabel } from '@/lib/calculators/versions';

export default function QTcCalc() {
  const [qt, setQt] = useState<number>(400);
  const [hr, setHr] = useState<number>(70);

  const meta = CALC_VERSIONS['QTc'];
  const versionLabel = getVersionLabel('QTc');

  const isValid = qt > 0 && hr > 0;
  const result = isValid ? calcQTc(qt, hr) : null;

  const severityColor =
    result?.severity === 'ok'
      ? 'bg-green-100 text-green-800'
      : result?.severity === 'warn'
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800';

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">QTc</h3>
        {versionLabel && (
          <span className="text-xs text-gray-500">{meta.formula} v{meta.version}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">QT interval (ms)</label>
          <input
            type="number"
            value={qt}
            onChange={(e) => setQt(Number(e.target.value))}
            min={100}
            max={800}
            className="w-full rounded border px-2 py-1"
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
            className="w-full rounded border px-2 py-1"
          />
        </div>
      </div>

      {result && (
        <div className="border-t pt-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className={`ml-auto px-2 py-0.5 rounded text-xs font-medium ${severityColor}`}>
              {result.level}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xs text-gray-500">Bazett</div>
              <div className="text-xl font-bold">{result.bazett}</div>
              <div className="text-xs text-gray-400">ms</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Fridericia</div>
              <div className="text-xl font-bold">{result.fridericia}</div>
              <div className="text-xs text-gray-400">ms</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Framingham</div>
              <div className="text-xl font-bold">{result.framingham}</div>
              <div className="text-xs text-gray-400">ms</div>
            </div>
          </div>
          <p className="text-sm text-gray-600">{result.interpretation}</p>
        </div>
      )}
    </div>
  );
}
