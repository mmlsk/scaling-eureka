'use client';

import { useState } from 'react';
import { calcWellsDVT } from '@/lib/calculators/formulas';
import { CALC_VERSIONS, getVersionLabel } from '@/lib/calculators/versions';

const RISK_FACTORS = [
  'Aktywny nowotwór (leczenie w ciągu 6 mies.)',
  'Porażenie / unieruchomienie kończyny dolnej',
  'Unieruchomienie >3 dni lub operacja w ciągu 12 tyg.',
  'Tkliwość wzdłuż żył głębokich',
  'Obrzęk całej kończyny dolnej',
  'Obrzęk łydki >3 cm vs. strona zdrowa',
  'Obrzęk ciastowaty (większy po stronie objawowej)',
  'Żyły powierzchowne krążenia obocznego',
];

export default function WellsDVTCalc() {
  const [checks, setChecks] = useState<boolean[]>(RISK_FACTORS.map(() => false));
  const [altDiagnosis, setAltDiagnosis] = useState(false);

  const meta = CALC_VERSIONS['Wells-DVT'];
  const versionLabel = getVersionLabel('Wells-DVT');

  const result = calcWellsDVT(checks, altDiagnosis);

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
        <h3 className="text-lg font-semibold">Wells DVT</h3>
        {versionLabel && (
          <span className="text-xs text-gray-500">{meta.formula} v{meta.version}</span>
        )}
      </div>

      <div className="space-y-2">
        {RISK_FACTORS.map((label, i) => (
          <label key={label} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={checks[i]}
              onChange={() => toggle(i)}
              className="rounded"
            />
            <span className="text-sm">{label}</span>
          </label>
        ))}
        <label className="flex items-center gap-2 cursor-pointer border-t pt-2">
          <input
            type="checkbox"
            checked={altDiagnosis}
            onChange={() => setAltDiagnosis((v) => !v)}
            className="rounded"
          />
          <span className="text-sm">Rozpoznanie alternatywne równie lub bardziej prawdopodobne (-2)</span>
        </label>
      </div>

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
    </div>
  );
}
