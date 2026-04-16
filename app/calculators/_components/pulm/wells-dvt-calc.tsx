'use client';

import { useState } from 'react';
import { calcWellsDVT } from '@/lib/calculators/formulas';

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


  const result = calcWellsDVT(checks, altDiagnosis);

  const toggle = (index: number) => {
    setChecks((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  return (
    <div className="space-y-4">
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
        <label className="flex items-center gap-2 cursor-pointer pt-2" style={{ borderTop: '1px solid var(--bor)' }}>
          <input
            type="checkbox"
            checked={altDiagnosis}
            onChange={() => setAltDiagnosis((v) => !v)}
            className="rounded"
          />
          <span className="text-sm">Rozpoznanie alternatywne równie lub bardziej prawdopodobne (-2)</span>
        </label>
      </div>

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
    </div>
  );
}
