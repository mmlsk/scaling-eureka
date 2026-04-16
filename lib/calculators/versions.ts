// Calculator version metadata — maps each calculator to its
// publication version and formula/citation reference.

export interface CalcVersionMeta {
  readonly version: string;
  readonly formula: string;
}

export const CALC_VERSIONS: Readonly<Record<string, CalcVersionMeta>> = {
  eGFR: {
    version: '2021.1',
    formula: 'CKD-EPI 2021',
  },
  CG: {
    version: '1976.1',
    formula: 'Cockcroft-Gault',
  },
  CHADS: {
    version: '2010.1',
    formula: 'CHA\u2082DS\u2082-VASc',
  },
  GCS: {
    version: '1974.1',
    formula: 'Teasdale & Jennett',
  },
  'CURB-65': {
    version: '2003.1',
    formula: 'Lim WS et al',
  },
  'Wells-DVT': {
    version: '2003.1',
    formula: 'Wells PS et al',
  },
  APGAR: {
    version: '1953.1',
    formula: 'Virginia Apgar',
  },
  Centor: {
    version: '1981.1',
    formula: 'Centor/McIsaac',
  },
  BMI: {
    version: '1832.1',
    formula: 'Quetelet/Mosteller',
  },
  'Child-Pugh': {
    version: '1973.1',
    formula: 'Pugh RN et al',
  },
  'Wells-PE': {
    version: '2000.1',
    formula: 'Wells PS et al',
  },
  PERC: {
    version: '2004.1',
    formula: 'Kline JA et al',
  },
  MAP: {
    version: 'std',
    formula: 'MAP = DBP + (SBP-DBP)/3',
  },
  AG: {
    version: 'std',
    formula: 'Na - Cl - HCO\u2083',
  },
  'Ca-corr': {
    version: 'std',
    formula: 'Ca + 0.8\u00D7(4-Alb)',
  },
  SOFA: {
    version: '1996.1',
    formula: 'Vincent JL et al',
  },
  qSOFA: {
    version: '2016.1',
    formula: 'Seymour CW et al (Sepsis-3)',
  },
  NEWS2: {
    version: '2017.1',
    formula: 'RCP UK',
  },
  'MELD-Na': {
    version: '2016.1',
    formula: 'OPTN/UNOS',
  },
  'Henderson-Hasselbalch': {
    version: '1917.1',
    formula: 'Henderson-Hasselbalch',
  },
  QTc: {
    version: '1920.1',
    formula: 'Bazett/Fridericia/Framingham',
  },
  Dose: {
    version: 'std',
    formula: 'mg/kg, mcg/kg/min',
  },
} as const;

/**
 * Get version string for a calculator, e.g. "eGFR v2021.1 (CKD-EPI 2021)".
 */
export function getVersionLabel(calcKey: string): string | undefined {
  const meta = CALC_VERSIONS[calcKey];
  if (!meta) return undefined;
  return `${calcKey} v${meta.version} (${meta.formula})`;
}
