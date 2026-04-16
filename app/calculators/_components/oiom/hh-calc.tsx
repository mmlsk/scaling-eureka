'use client';

import { useState } from 'react';
import { calcHH, type HHInput } from '@/lib/calculators/formulas';

export default function HHCalc() {
  const [ph, setPh] = useState<number>(7.40);
  const [pco2, setPco2] = useState<number>(40);
  const [hco3, setHco3] = useState<number>(24);
  const [pao2, setPao2] = useState<string>('');
  const [fio2, setFio2] = useState<string>('');
  const [na, setNa] = useState<string>('');
  const [cl, setCl] = useState<string>('');
  const [alb, setAlb] = useState<string>('');


  const isValid = ph > 0 && pco2 > 0 && hco3 > 0;

  const input: HHInput = {
    ph,
    pco2,
    hco3,
    pao2: pao2 ? Number(pao2) : undefined,
    fio2: fio2 ? Number(fio2) : undefined,
    na: na ? Number(na) : undefined,
    cl: cl ? Number(cl) : undefined,
    alb: alb ? Number(alb) : undefined,
  };

  const result = isValid ? calcHH(input) : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">pH</label>
          <input
            type="number"
            value={ph}
            onChange={(e) => setPh(Number(e.target.value))}
            step={0.01}
            min={6.5}
            max={8.0}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">PaCO2 (mmHg)</label>
          <input
            type="number"
            value={pco2}
            onChange={(e) => setPco2(Number(e.target.value))}
            min={5}
            max={150}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">HCO3 (mEq/L)</label>
          <input
            type="number"
            value={hco3}
            onChange={(e) => setHco3(Number(e.target.value))}
            min={1}
            max={60}
            className="input-field"
          />
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        <div>
          <label className="block text-xs font-medium mb-1">PaO2</label>
          <input
            type="number"
            value={pao2}
            onChange={(e) => setPao2(e.target.value)}
            placeholder="opt."
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">FiO2 (%)</label>
          <input
            type="number"
            value={fio2}
            onChange={(e) => setFio2(e.target.value)}
            placeholder="opt."
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Na+</label>
          <input
            type="number"
            value={na}
            onChange={(e) => setNa(e.target.value)}
            placeholder="opt."
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Cl-</label>
          <input
            type="number"
            value={cl}
            onChange={(e) => setCl(e.target.value)}
            placeholder="opt."
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Alb (g/dL)</label>
          <input
            type="number"
            value={alb}
            onChange={(e) => setAlb(e.target.value)}
            placeholder="opt."
            className="input-field"
          />
        </div>
      </div>

      {result && (
        <div className="pt-3 space-y-2" style={{ borderTop: '1px solid var(--bor)' }}>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">{result.disorder}</span>
          </div>
          <div className="space-y-1">
            {result.lines.map((line, i) => (
              <p key={i} className="text-sm font-mono" style={{ color: 'var(--tx)' }}>{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
