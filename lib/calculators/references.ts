// Clinical reference ranges for all 22 calculators
// Interpretation text in Polish

export type Severity = 'ok' | 'warn' | 'crit';

export interface ReferenceRange {
  readonly label: string;
  readonly min?: number;
  readonly max?: number;
  readonly severity: Severity;
  readonly interpretation: string;
}

export interface CalculatorReference {
  readonly name: string;
  readonly unit: string;
  readonly ranges: readonly ReferenceRange[];
}

export const REFERENCE_RANGES: Readonly<Record<string, CalculatorReference>> = {
  eGFR: {
    name: 'eGFR (CKD-EPI 2021)',
    unit: 'mL/min/1.73m\u00B2',
    ranges: [
      { label: 'G1', min: 90, max: undefined, severity: 'ok', interpretation: 'Prawid\u0142owe lub wysokie' },
      { label: 'G2', min: 60, max: 89, severity: 'ok', interpretation: '\u0141agodnie obni\u017Cone' },
      { label: 'G3a', min: 45, max: 59, severity: 'warn', interpretation: '\u0141agodnie\u2013umiarkowanie obni\u017Cone' },
      { label: 'G3b', min: 30, max: 44, severity: 'warn', interpretation: 'Umiarkowanie\u2013znacznie obni\u017Cone' },
      { label: 'G4', min: 15, max: 29, severity: 'crit', interpretation: 'Znacznie obni\u017Cone' },
      { label: 'G5', min: undefined, max: 14, severity: 'crit', interpretation: 'Niewydolno\u015B\u0107 nerek' },
    ],
  },

  CG: {
    name: 'Klirens kreatyniny (Cockcroft-Gault)',
    unit: 'mL/min',
    ranges: [
      { label: 'Normal', min: 90, max: undefined, severity: 'ok', interpretation: 'Pe\u0142na czynno\u015B\u0107' },
      { label: '\u0141agodna', min: 60, max: 89, severity: 'ok', interpretation: 'Dawkowanie standardowe' },
      { label: 'Umiarkowana', min: 30, max: 59, severity: 'warn', interpretation: 'Redukcja dawki wielu lek\u00F3w' },
      { label: 'Ci\u0119\u017Cka', min: 15, max: 29, severity: 'crit', interpretation: 'Znaczna redukcja dawek' },
      { label: 'Schy\u0142kowa', min: undefined, max: 14, severity: 'crit', interpretation: 'Hemodializa / dializoterapia' },
    ],
  },

  CHADS: {
    name: 'CHA\u2082DS\u2082-VASc',
    unit: 'pkt',
    ranges: [
      { label: 'NISKIE', min: 0, max: 0, severity: 'ok', interpretation: '0% rocz. ryzyko. Brak antykoagulacji.' },
      { label: 'NISKIE (1 pkt)', min: 1, max: 1, severity: 'warn', interpretation: '1.3% rocz. ryzyko. Rozwa\u017Cy\u0107 NOAC.' },
      { label: 'UMIARKOWANE', min: 2, max: 3, severity: 'warn', interpretation: '2.2\u20133.2% rocz. ryzyko. NOAC wskazany (ESC).' },
      { label: 'WYSOKIE', min: 4, max: 5, severity: 'crit', interpretation: '4.0\u20136.7% rocz. ryzyko. NOAC wskazany.' },
      { label: 'BARDZO WYSOKIE', min: 6, max: 9, severity: 'crit', interpretation: '9.6\u201315.2% rocz. ryzyko. NOAC obowi\u0105zkowo.' },
    ],
  },

  GCS: {
    name: 'Skala Glasgow (GCS)',
    unit: 'pkt',
    ranges: [
      { label: '\u0141AGODNY', min: 13, max: 15, severity: 'ok', interpretation: 'GCS 13\u201315. Przytomny, kontakt s\u0142owny zachowany.' },
      { label: 'UMIARKOWANY', min: 9, max: 12, severity: 'warn', interpretation: 'GCS 9\u201312. Zaburzenia \u015Bwiadomo\u015Bci.' },
      { label: 'CI\u0118\u017BKI', min: 3, max: 8, severity: 'crit', interpretation: 'GCS \u22648 \u2192 intubacja. \u015Api\u0105czka.' },
    ],
  },

  'CURB-65': {
    name: 'CURB-65 (zapalenie p\u0142uc)',
    unit: 'pkt',
    ranges: [
      { label: 'NISKIE', min: 0, max: 1, severity: 'ok', interpretation: 'Ambulatoryjne. \u015Amiertelno\u015B\u0107 1\u20132%.' },
      { label: 'PO\u015AREDNIE', min: 2, max: 2, severity: 'warn', interpretation: 'Hospitalizacja. \u015Amiertelno\u015B\u0107 ~9%.' },
      { label: 'WYSOKIE', min: 3, max: 5, severity: 'crit', interpretation: 'OIT do rozwa\u017Cenia. \u015Amiertelno\u015B\u0107 ~17\u201322%.' },
    ],
  },

  'Wells-DVT': {
    name: 'Wells DVT',
    unit: 'pkt',
    ranges: [
      { label: 'NISKIE', min: undefined, max: 0, severity: 'ok', interpretation: '~3% prawdopodobie\u0144stwo DVT. D-dimer i obserwacja.' },
      { label: 'PO\u015AREDNIE', min: 1, max: 2, severity: 'warn', interpretation: '~17% prawdopodobie\u0144stwo DVT. USG \u017Cy\u0142.' },
      { label: 'WYSOKIE', min: 3, max: undefined, severity: 'crit', interpretation: '~75% prawdopodobie\u0144stwo DVT. USG + antykoagulacja.' },
    ],
  },

  APGAR: {
    name: 'Skala APGAR',
    unit: 'pkt',
    ranges: [
      { label: 'NORMA', min: 7, max: 10, severity: 'ok', interpretation: 'Stan dobry. Rutynowe post\u0119powanie.' },
      { label: 'UMIARKOWANY', min: 4, max: 6, severity: 'warn', interpretation: 'Wsparcie oddechowe, ciep\u0142o, stymulacja.' },
      { label: 'KRYTYCZNY', min: 0, max: 3, severity: 'crit', interpretation: 'Natychmiastowa resuscytacja noworodka!' },
    ],
  },

  Centor: {
    name: 'Centor / McIsaac',
    unit: 'pkt',
    ranges: [
      { label: 'NISKIE', min: undefined, max: 0, severity: 'ok', interpretation: '<10% GAS. Nie leczy\u0107 antybiotykiem.' },
      { label: 'NISKIE (1 pkt)', min: 1, max: 1, severity: 'ok', interpretation: '~10% GAS. Obserwacja bez antybiotyku.' },
      { label: 'PO\u015AREDNIE', min: 2, max: 2, severity: 'warn', interpretation: '~17\u201335% GAS. Rozwa\u017Cy\u0107 wymazanie gard\u0142a.' },
      { label: 'UMIARKOWANE', min: 3, max: 3, severity: 'warn', interpretation: '~35\u201356% GAS. Penicylina V lub amoksy.' },
      { label: 'WYSOKIE', min: 4, max: undefined, severity: 'crit', interpretation: '~52\u201365% GAS. Antybiotyk empirycznie.' },
    ],
  },

  BMI: {
    name: 'BMI / BSA',
    unit: 'kg/m\u00B2',
    ranges: [
      { label: 'Niedowaga', min: undefined, max: 18.4, severity: 'warn', interpretation: 'BMI<18.5. Niedowaga.' },
      { label: 'Norma', min: 18.5, max: 24.9, severity: 'ok', interpretation: 'BMI 18.5\u201324.9. Prawid\u0142owa masa cia\u0142a.' },
      { label: 'Nadwaga', min: 25, max: 29.9, severity: 'warn', interpretation: 'BMI 25\u201329.9. Nadwaga.' },
      { label: 'Oty\u0142o\u015B\u0107 I', min: 30, max: 34.9, severity: 'crit', interpretation: 'BMI 30\u201334.9. Oty\u0142o\u015B\u0107 I stopnia.' },
      { label: 'Oty\u0142o\u015B\u0107 II', min: 35, max: 39.9, severity: 'crit', interpretation: 'BMI 35\u201339.9. Oty\u0142o\u015B\u0107 II stopnia.' },
      { label: 'Oty\u0142o\u015B\u0107 III', min: 40, max: undefined, severity: 'crit', interpretation: 'BMI\u226540. Oty\u0142o\u015B\u0107 chorobliwa.' },
    ],
  },

  'Child-Pugh': {
    name: 'Child-Pugh (marsko\u015B\u0107 w\u0105troby)',
    unit: 'pkt',
    ranges: [
      { label: 'Klasa A', min: 5, max: 6, severity: 'ok', interpretation: '\u015Amiertelno\u015B\u0107 <5%/rok. Dobra rezerwa w\u0105trobowa.' },
      { label: 'Klasa B', min: 7, max: 9, severity: 'warn', interpretation: '\u015Amiertelno\u015B\u0107 20\u201330%/rok. Umiarkowana rezerwa.' },
      { label: 'Klasa C', min: 10, max: 15, severity: 'crit', interpretation: '\u015Amiertelno\u015B\u0107 >80%/rok. Z\u0142a rezerwa.' },
    ],
  },

  'Wells-PE': {
    name: 'Wells PE (zatorowo\u015B\u0107 p\u0142ucna)',
    unit: 'pkt',
    ranges: [
      { label: 'NISKIE', min: 0, max: 1, severity: 'ok', interpretation: 'PE ma\u0142o prawdopodobna. D-dimer.' },
      { label: 'PO\u015AREDNIE', min: 2, max: 4, severity: 'warn', interpretation: 'PE mo\u017Cliwa. CTPA / V/Q.' },
      { label: 'WYSOKIE', min: 5, max: undefined, severity: 'crit', interpretation: 'PE bardzo prawdopodobna. CTPA natychmiast.' },
    ],
  },

  PERC: {
    name: 'PERC Rule',
    unit: 'kryteria',
    ranges: [
      { label: 'UJEMNY', min: 8, max: 8, severity: 'ok', interpretation: 'Wszystkie spe\u0142nione. PE wykluczona klinicznie.' },
      { label: 'DODATNI', min: 0, max: 7, severity: 'warn', interpretation: 'Nie wszystkie spe\u0142nione. Dalsze badania (D-dimer / CTPA).' },
    ],
  },

  MAP: {
    name: 'MAP (\u015Brednie ci\u015Bnienie t\u0119tnicze)',
    unit: 'mmHg',
    ranges: [
      { label: 'NISKIE', min: undefined, max: 69, severity: 'crit', interpretation: 'Hipoperfuzja narz\u0105dowa! Rozwa\u017C wazopresory.' },
      { label: 'NORMA', min: 70, max: 105, severity: 'ok', interpretation: 'Prawid\u0142owe ci\u015Bnienie perfuzji.' },
      { label: 'WYSOKIE', min: 106, max: undefined, severity: 'warn', interpretation: 'Podwy\u017Cszone MAP. Monitoruj narz\u0105dy docelowe.' },
    ],
  },

  AG: {
    name: 'Luka anionowa (Anion Gap)',
    unit: 'mEq/L',
    ranges: [
      { label: 'OBNI\u017BONA', min: undefined, max: 7, severity: 'warn', interpretation: 'Niska AG. Rozwa\u017C hipoalbuminemi\u0119, zatrucie litem.' },
      { label: 'NORMA', min: 8, max: 12, severity: 'ok', interpretation: 'Prawid\u0142owa luka anionowa (8\u201312 mEq/L).' },
      { label: 'PODWY\u017BSZONA', min: 13, max: undefined, severity: 'crit', interpretation: 'Kwasica metaboliczna z podwy\u017Cszon\u0105 AG. MUDPILES.' },
    ],
  },

  'Ca-corr': {
    name: 'Wap\u0144 skorygowany',
    unit: 'mg/dL',
    ranges: [
      { label: 'HIPOKALCEMIA', min: undefined, max: 8.4, severity: 'warn', interpretation: 'Obni\u017Cone Ca. Rozwa\u017C suplementacj\u0119, PTH, Mg.' },
      { label: 'NORMA', min: 8.5, max: 10.5, severity: 'ok', interpretation: 'Skorygowane Ca w normie (8.5\u201310.5 mg/dL).' },
      { label: 'HIPERKALCEMIA', min: 10.6, max: undefined, severity: 'crit', interpretation: 'Podwy\u017Cszone Ca. Rozwa\u017C PTH, nowotw\u00F3r, wit. D.' },
    ],
  },

  SOFA: {
    name: 'SOFA Score',
    unit: 'pkt',
    ranges: [
      { label: 'NISKIE', min: 0, max: 1, severity: 'ok', interpretation: '\u015Amiertelno\u015B\u0107 <10%.' },
      { label: 'NISKIE-\u015AR', min: 2, max: 3, severity: 'ok', interpretation: '\u015Amiertelno\u015B\u0107 15\u201320%.' },
      { label: '\u015AREDNIE', min: 4, max: 5, severity: 'warn', interpretation: '\u015Amiertelno\u015B\u0107 25\u201330%.' },
      { label: 'WYSOKIE', min: 6, max: 7, severity: 'warn', interpretation: '\u015Amiertelno\u015B\u0107 ~45%.' },
      { label: 'KRYTYCZNE', min: 8, max: 24, severity: 'crit', interpretation: '\u015Amiertelno\u015B\u0107 >50%! Eskalacja leczenia.' },
    ],
  },

  qSOFA: {
    name: 'qSOFA (Sepsis-3)',
    unit: 'pkt',
    ranges: [
      { label: 'NISKIE', min: 0, max: 1, severity: 'ok', interpretation: 'Niskie ryzyko sepsy.' },
      { label: 'WYSOKIE', min: 2, max: 3, severity: 'crit', interpretation: 'Wg Sepsis-3: podejrzenie sepsy \u2192 sprawd\u017A SOFA.' },
    ],
  },

  NEWS2: {
    name: 'NEWS2 (RCP UK)',
    unit: 'pkt',
    ranges: [
      { label: 'NISKIE', min: 0, max: 4, severity: 'ok', interpretation: 'Rutynowa obserwacja.' },
      { label: '\u015AREDNIE', min: 5, max: 6, severity: 'warn', interpretation: 'Pilna ocena \u2014 rozwa\u017C OIT.' },
      { label: 'WYSOKIE', min: 7, max: undefined, severity: 'crit', interpretation: 'Pilna eskalacja! Zesp\u00F3\u0142 resuscytacyjny.' },
    ],
  },

  'MELD-Na': {
    name: 'MELD-Na (transplantacja w\u0105troby)',
    unit: 'pkt',
    ranges: [
      { label: 'NISKI', min: 6, max: 9, severity: 'ok', interpretation: '\u015Am. 90d: 1.9%. Niska priorytet transplantacji.' },
      { label: '\u015AREDNI', min: 10, max: 19, severity: 'warn', interpretation: '\u015Am. 90d: 6%. Rozwa\u017Cy\u0107 kwalifikacj\u0119.' },
      { label: 'WYSOKI', min: 20, max: 29, severity: 'warn', interpretation: '\u015Am. 90d: 19.6%. Priorytet transplantacji.' },
      { label: 'KRYTYCZNY', min: 30, max: 40, severity: 'crit', interpretation: '\u015Am. 90d: 52.6%+. Pilna transplantacja.' },
    ],
  },

  'Henderson-Hasselbalch': {
    name: 'Henderson-Hasselbalch (r\u00F3wnowaga kwasowo-zasadowa)',
    unit: 'pH',
    ranges: [
      { label: 'Kwasica ci\u0119\u017Cka', min: undefined, max: 7.19, severity: 'crit', interpretation: 'Ci\u0119\u017Cka kwasica. Zagro\u017Cenie \u017Cycia.' },
      { label: 'Kwasica', min: 7.20, max: 7.34, severity: 'warn', interpretation: 'Kwasica metaboliczna lub oddechowa.' },
      { label: 'Norma', min: 7.35, max: 7.45, severity: 'ok', interpretation: 'Prawid\u0142owe pH krwi t\u0119tniczej.' },
      { label: 'Zasadowica', min: 7.46, max: 7.59, severity: 'warn', interpretation: 'Zasadowica metaboliczna lub oddechowa.' },
      { label: 'Zasadowica ci\u0119\u017Cka', min: 7.60, max: undefined, severity: 'crit', interpretation: 'Ci\u0119\u017Cka zasadowica. Zagro\u017Cenie \u017Cycia.' },
    ],
  },

  QTc: {
    name: 'QTc (skorygowany QT)',
    unit: 'ms',
    ranges: [
      { label: 'NORMA', min: undefined, max: 450, severity: 'ok', interpretation: 'QTc w normie.' },
      { label: 'GRANICZNY', min: 451, max: 470, severity: 'warn', interpretation: 'QTc graniczny (>450ms \u2642).' },
      { label: 'WYD\u0141U\u017BONY', min: 471, max: 500, severity: 'warn', interpretation: 'QTc wyd\u0142u\u017Cony (>470ms \u2640).' },
      { label: 'KRYTYCZNY', min: 501, max: undefined, severity: 'crit', interpretation: 'QTc>500ms \u2014 ryzyko TdP!' },
    ],
  },

  Dose: {
    name: 'Kalkulator dawkowania',
    unit: 'mg lub mcg/kg/min',
    ranges: [
      { label: 'Dawka jednorazowa', min: undefined, max: undefined, severity: 'ok', interpretation: 'Obliczona dawka na podstawie masy cia\u0142a (mg/kg).' },
      { label: 'Wlew ci\u0105g\u0142y', min: undefined, max: undefined, severity: 'ok', interpretation: 'Obliczona pr\u0119dko\u015B\u0107 wlewu (mcg/kg/min).' },
    ],
  },
} as const;

/**
 * Look up the reference range entry that matches a given numeric value
 * for a specific calculator.
 */
export function findRange(
  calcKey: string,
  value: number,
): ReferenceRange | undefined {
  const calc = REFERENCE_RANGES[calcKey];
  if (!calc) return undefined;

  return calc.ranges.find((r) => {
    const aboveMin = r.min === undefined || value >= r.min;
    const belowMax = r.max === undefined || value <= r.max;
    return aboveMin && belowMax;
  });
}

/**
 * Return the severity for a given calculator value.
 */
export function getSeverity(
  calcKey: string,
  value: number,
): Severity | undefined {
  return findRange(calcKey, value)?.severity;
}
