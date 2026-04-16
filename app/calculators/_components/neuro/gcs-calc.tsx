'use client';

import { useState } from 'react';
import { calcGCS } from '@/lib/calculators/formulas';
import { CALC_VERSIONS, getVersionLabel } from '@/lib/calculators/versions';

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

  const meta = CALC_VERSIONS['GCS'];
  const versionLabel = getVersionLabel('GCS');

  const result = calcGCS(eye, verbal, motor);

  const severityColor =
    result.severity === 'ok'
      ? 'bg-green-100 text-green-800'
      : result.severity === 'warn'
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800';

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">GCS (Glasgow Coma Scale)</h3>
        {versionLabel && (
          <span className="text-xs text-gray-500">{meta.formula} v{meta.version}</span>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Eye (E)</label>
          <select
            value={eye}
            onChange={(e) => setEye(Number(e.target.value))}
            className="w-full rounded border px-2 py-1"
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
            className="w-full rounded border px-2 py-1"
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
            className="w-full rounded border px-2 py-1"
          >
            {MOTOR_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-t pt-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{result.value}</span>
          <span className="text-sm text-gray-500">E{eye}V{verbal}M{motor}</span>
          <span className={`ml-auto px-2 py-0.5 rounded text-xs font-medium ${severityColor}`}>
            {result.stage}
          </span>
        </div>
        <p className="text-sm text-gray-600">{result.interpretation}</p>
      </div>
    </div>
  );
}
