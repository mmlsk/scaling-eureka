'use client';

import { useState } from 'react';
import { calcGCS } from '@/lib/calculators/formulas';

interface SelectOption {
  value: number;
  label: string;
}

const EYE_OPTIONS: SelectOption[] = [
  { value: 1, label: '1 — Brak reakcji' },
  { value: 2, label: '2 — Na ból' },
  { value: 3, label: '3 — Na głos' },
  { value: 4, label: '4 — Spontaniczne' },
];

const VERBAL_OPTIONS: SelectOption[] = [
  { value: 1, label: '1 — Brak' },
  { value: 2, label: '2 — Niezrozumiałe dźwięki' },
  { value: 3, label: '3 — Nieprawidłowe słowa' },
  { value: 4, label: '4 — Splątany' },
  { value: 5, label: '5 — Orientuje się' },
];

const MOTOR_OPTIONS: SelectOption[] = [
  { value: 1, label: '1 — Brak reakcji' },
  { value: 2, label: '2 — Wyprost (decerebr.)' },
  { value: 3, label: '3 — Zgięcie (decort.)' },
  { value: 4, label: '4 — Cofanie' },
  { value: 5, label: '5 — Lokalizuje ból' },
  { value: 6, label: '6 — Wykonuje polecenia' },
];

export default function GCSCalc() {
  const [eye, setEye] = useState<number>(4);
  const [verbal, setVerbal] = useState<number>(5);
  const [motor, setMotor] = useState<number>(6);


  const result = calcGCS(eye, verbal, motor);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Eye (E)</label>
          <select
            value={eye}
            onChange={(e) => setEye(Number(e.target.value))}
            className="input-field"
          >
            {EYE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Verbal (V)</label>
          <select
            value={verbal}
            onChange={(e) => setVerbal(Number(e.target.value))}
            className="input-field"
          >
            {VERBAL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Motor (M)</label>
          <select
            value={motor}
            onChange={(e) => setMotor(Number(e.target.value))}
            className="input-field"
          >
            {MOTOR_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="pt-3 space-y-2" style={{ borderTop: '1px solid var(--bor)' }}>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{result.value}</span>
          <span className="text-sm" style={{ color: 'var(--txm)' }}>E{eye}V{verbal}M{motor}</span>
          <span className={`calc-badge ${result.severity}`}>
            {result.stage}
          </span>
        </div>
        <p className="text-sm" style={{ color: 'var(--txm)' }}>{result.interpretation}</p>
      </div>
    </div>
  );
}
