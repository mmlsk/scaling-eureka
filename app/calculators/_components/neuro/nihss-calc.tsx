'use client';

import { useState } from 'react';
import { calcNIHSS } from '@/lib/calculators/formulas';
import { CALC_VERSIONS, getVersionLabel } from '@/lib/calculators/versions';

interface NIHSSCategory {
  label: string;
  options: { value: number; label: string }[];
}

const CATEGORIES: NIHSSCategory[] = [
  {
    label: '1a. Poziom świadomości',
    options: [
      { value: 0, label: '0 — Przytomny' },
      { value: 1, label: '1 — Senny' },
      { value: 2, label: '2 — Stupor' },
      { value: 3, label: '3 — Śpiączka' },
    ],
  },
  {
    label: '1b. Orientacja (pytania)',
    options: [
      { value: 0, label: '0 — Oba poprawne' },
      { value: 1, label: '1 — Jedno poprawne' },
      { value: 2, label: '2 — Żadne poprawne' },
    ],
  },
  {
    label: '1c. Polecenia',
    options: [
      { value: 0, label: '0 — Oba wykonane' },
      { value: 1, label: '1 — Jedno wykonane' },
      { value: 2, label: '2 — Żadne wykonane' },
    ],
  },
  {
    label: '2. Spojrzenie',
    options: [
      { value: 0, label: '0 — Prawidłowe' },
      { value: 1, label: '1 — Częściowy niedowład' },
      { value: 2, label: '2 — Wymuszone zbaczanie' },
    ],
  },
  {
    label: '3. Pole widzenia',
    options: [
      { value: 0, label: '0 — Prawidłowe' },
      { value: 1, label: '1 — Częściowa hemianopsja' },
      { value: 2, label: '2 — Całkowita hemianopsja' },
      { value: 3, label: '3 — Obustronna hemianopsja' },
    ],
  },
  {
    label: '4. Niedowład twarzy',
    options: [
      { value: 0, label: '0 — Prawidłowy' },
      { value: 1, label: '1 — Niewielki' },
      { value: 2, label: '2 — Częściowy' },
      { value: 3, label: '3 — Całkowity' },
    ],
  },
  {
    label: '5a. Kończyna górna L',
    options: [
      { value: 0, label: '0 — Brak opadania' },
      { value: 1, label: '1 — Opada przed 10s' },
      { value: 2, label: '2 — Pewien wysiłek p/ciążeniu' },
      { value: 3, label: '3 — Opada, brak p/ciążeniu' },
      { value: 4, label: '4 — Brak ruchu' },
    ],
  },
  {
    label: '5b. Kończyna górna P',
    options: [
      { value: 0, label: '0 — Brak opadania' },
      { value: 1, label: '1 — Opada przed 10s' },
      { value: 2, label: '2 — Pewien wysiłek p/ciążeniu' },
      { value: 3, label: '3 — Opada, brak p/ciążeniu' },
      { value: 4, label: '4 — Brak ruchu' },
    ],
  },
  {
    label: '6a. Kończyna dolna L',
    options: [
      { value: 0, label: '0 — Brak opadania' },
      { value: 1, label: '1 — Opada przed 5s' },
      { value: 2, label: '2 — Pewien wysiłek p/ciążeniu' },
      { value: 3, label: '3 — Opada, brak p/ciążeniu' },
      { value: 4, label: '4 — Brak ruchu' },
    ],
  },
  {
    label: '6b. Kończyna dolna P',
    options: [
      { value: 0, label: '0 — Brak opadania' },
      { value: 1, label: '1 — Opada przed 5s' },
      { value: 2, label: '2 — Pewien wysiłek p/ciążeniu' },
      { value: 3, label: '3 — Opada, brak p/ciążeniu' },
      { value: 4, label: '4 — Brak ruchu' },
    ],
  },
  {
    label: '7. Ataksja kończyn',
    options: [
      { value: 0, label: '0 — Brak' },
      { value: 1, label: '1 — W jednej kończynie' },
      { value: 2, label: '2 — W dwóch kończynach' },
    ],
  },
  {
    label: '8. Czucie',
    options: [
      { value: 0, label: '0 — Prawidłowe' },
      { value: 1, label: '1 — Łagodne zaburzenia' },
      { value: 2, label: '2 — Ciężkie zaburzenia' },
    ],
  },
  {
    label: '9. Język',
    options: [
      { value: 0, label: '0 — Prawidłowy' },
      { value: 1, label: '1 — Łagodna afazja' },
      { value: 2, label: '2 — Ciężka afazja' },
      { value: 3, label: '3 — Mutyzm / afazja globalna' },
    ],
  },
  {
    label: '10. Dyzartria',
    options: [
      { value: 0, label: '0 — Prawidłowa' },
      { value: 1, label: '1 — Łagodna' },
      { value: 2, label: '2 — Ciężka / anartria' },
    ],
  },
  {
    label: '11. Wygaszanie / nieuwaga',
    options: [
      { value: 0, label: '0 — Brak' },
      { value: 1, label: '1 — Częściowa' },
      { value: 2, label: '2 — Całkowita' },
    ],
  },
];

export default function NIHSSCalc() {
  const [scores, setScores] = useState<number[]>(CATEGORIES.map(() => 0));

  const meta = CALC_VERSIONS['GCS']; // NIHSS not in versions, fallback
  const result = calcNIHSS(scores);

  const handleChange = (index: number, value: number) => {
    setScores((prev) => {
      const next = [...prev];
      next[index] = value;
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
        <h3 className="text-lg font-semibold">NIHSS</h3>
        <span className="text-xs text-gray-500">NIH Stroke Scale</span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {CATEGORIES.map((cat, i) => (
          <div key={cat.label}>
            <label className="block text-sm font-medium mb-1">{cat.label}</label>
            <select
              value={scores[i]}
              onChange={(e) => handleChange(i, Number(e.target.value))}
              className="w-full rounded border px-2 py-1 text-sm"
            >
              {cat.options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="border-t pt-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{result.value}</span>
          <span className="text-sm text-gray-500">/ 42 pkt</span>
          <span className={`ml-auto px-2 py-0.5 rounded text-xs font-medium ${severityColor}`}>
            {result.stage}
          </span>
        </div>
        <p className="text-sm text-gray-600">{result.interpretation}</p>
      </div>
    </div>
  );
}
