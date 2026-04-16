// Regression tests ported from tests/calc-tests.js → Vitest
// Tests pure calculator functions from @/lib/calculators/formulas

import { describe, it, expect } from 'vitest';
import {
  calcEGFR,
  calcCG,
  calcMAP,
  calcAnionGap,
  calcCorrectedCa,
  calcBMI,
  calcMELDNa,
  calcHH,
  calcQTc,
  calcSOFA,
  calcQSOFA,
  calcNEWS2,
  calcCHADS,
  calcDose,
  type CHADSInput,
  type NEWS2Input,
} from '@/lib/calculators/formulas';

// ── eGFR CKD-EPI 2021 ──
describe('eGFR CKD-EPI 2021', () => {
  it('male 30yr Cr 1.0 → ~104', () => {
    const r = calcEGFR(1.0, 30, 'M');
    expect(r.value).toBeCloseTo(104, -1);
  });

  it('female 65yr Cr 1.5 → ~37', () => {
    const r = calcEGFR(1.5, 65, 'F');
    expect(r.value).toBeCloseTo(37, -1);
  });

  it('male 50yr Cr 0.8 → ~106', () => {
    const r = calcEGFR(0.8, 50, 'M');
    expect(r.value).toBeCloseTo(106, -1);
  });
});

// ── Cockcroft-Gault ──
describe('Cockcroft-Gault', () => {
  it('male 30yr 70kg Cr 1.0 → ~107', () => {
    const r = calcCG(1.0, 30, 70, 'M');
    expect(r.value).toBeCloseTo(107, -1);
  });

  it('female 60yr 55kg Cr 1.2 → ~44', () => {
    const r = calcCG(1.2, 60, 55, 'F');
    expect(r.value).toBeCloseTo(44, -1);
  });
});

// ── MAP ──
describe('MAP', () => {
  it('120/80 → 93', () => {
    const r = calcMAP(120, 80);
    expect(r.value).toBe(93);
  });

  it('90/60 → 70', () => {
    const r = calcMAP(90, 60);
    expect(r.value).toBe(70);
  });

  it('180/110 → 133', () => {
    const r = calcMAP(180, 110);
    expect(r.value).toBe(133);
  });
});

// ── Anion Gap ──
describe('Anion Gap', () => {
  it('normal 140/104/24 → 12', () => {
    const r = calcAnionGap(140, 104, 24);
    expect(r.value).toBe(12);
  });

  it('elevated 145/100/20 → 25', () => {
    const r = calcAnionGap(145, 100, 20);
    expect(r.value).toBe(25);
  });
});

// ── Corrected Ca ──
describe('Corrected Calcium', () => {
  it('Ca 9.0 / Alb 4.0 → 9.0', () => {
    const r = calcCorrectedCa(9.0, 4.0);
    expect(r.value).toBeCloseTo(9.0, 1);
  });

  it('Ca 8.0 / Alb 2.0 → 9.6', () => {
    const r = calcCorrectedCa(8.0, 2.0);
    expect(r.value).toBeCloseTo(9.6, 1);
  });
});

// ── BMI ──
describe('BMI', () => {
  it('70kg/175cm → 22.9', () => {
    const r = calcBMI(70, 175);
    expect(r.value).toBeCloseTo(22.9, 0);
  });

  it('100kg/170cm → 34.6', () => {
    const r = calcBMI(100, 170);
    expect(r.value).toBeCloseTo(34.6, 0);
  });
});

// ── MELD-Na ──
describe('MELD-Na', () => {
  it('Bil 1/INR 1/Cr 1/Na 140 → 6', () => {
    const r = calcMELDNa(1, 1, 1, 140, false);
    expect(Math.abs(Number(r.value) - 6)).toBeLessThanOrEqual(1);
  });

  it('Bil 3/INR 2/Cr 1.5/Na 130 → ~26', () => {
    const r = calcMELDNa(3, 2, 1.5, 130, false);
    expect(Math.abs(Number(r.value) - 26)).toBeLessThanOrEqual(3);
  });

  it('dialysis → ~28', () => {
    const r = calcMELDNa(2, 1.5, 1, 135, true);
    expect(Math.abs(Number(r.value) - 28)).toBeLessThanOrEqual(3);
  });
});

// ── Henderson-Hasselbalch ──
describe('Henderson-Hasselbalch', () => {
  it('HCO3 24 / PaCO2 40 → pH ~7.40', () => {
    const r = calcHH({ ph: 7.40, pco2: 40, hco3: 24 });
    expect(r.calcPh).toBeCloseTo(7.40, 1);
  });

  it('HCO3 12 / PaCO2 20 → pH ~7.40', () => {
    const r = calcHH({ ph: 7.40, pco2: 20, hco3: 12 });
    expect(r.calcPh).toBeCloseTo(7.40, 1);
  });

  it('HCO3 24 / PaCO2 80 → pH ~7.10', () => {
    const r = calcHH({ ph: 7.10, pco2: 80, hco3: 24 });
    expect(r.calcPh).toBeCloseTo(7.10, 1);
  });
});

// ── P/F ratio (via Henderson-Hasselbalch) ──
describe('P/F ratio', () => {
  it('PaO2 95 / FiO2 21 → ~452', () => {
    const r = calcHH({ ph: 7.40, pco2: 40, hco3: 24, pao2: 95, fio2: 21 });
    expect(r.pfRatio).toBeDefined();
    expect(r.pfRatio!).toBeCloseTo(452, -1);
  });

  it('PaO2 60 / FiO2 100 → 60', () => {
    const r = calcHH({ ph: 7.40, pco2: 40, hco3: 24, pao2: 60, fio2: 100 });
    expect(r.pfRatio).toBe(60);
  });
});

// ── A-a gradient (via Henderson-Hasselbalch) ──
describe('A-a gradient', () => {
  it('FiO2 21% / PaCO2 40 / PaO2 95 → ~4.7', () => {
    const r = calcHH({ ph: 7.40, pco2: 40, hco3: 24, pao2: 95, fio2: 21 });
    expect(r.aaGradient).toBeDefined();
    expect(r.aaGradient!).toBeCloseTo(4.7, 0);
  });
});

// ── QTc Bazett ──
describe('QTc Bazett', () => {
  it('400ms / 60bpm → 400', () => {
    const r = calcQTc(400, 60);
    expect(r.bazett).toBe(400);
  });

  it('400ms / 100bpm → ~516', () => {
    const r = calcQTc(400, 100);
    expect(Math.abs(r.bazett - 516)).toBeLessThanOrEqual(2);
  });
});

// ── QTc Fridericia ──
describe('QTc Fridericia', () => {
  it('400ms / 60bpm → 400', () => {
    const r = calcQTc(400, 60);
    expect(r.fridericia).toBe(400);
  });
});

// ── SOFA boundary ──
describe('SOFA boundaries', () => {
  it('min score (all 0) → 0', () => {
    const r = calcSOFA([0, 0, 0, 0, 0, 0]);
    expect(r.value).toBe(0);
  });

  it('max score (all 4) → 24', () => {
    const r = calcSOFA([4, 4, 4, 4, 4, 4]);
    expect(r.value).toBe(24);
  });
});

// ── qSOFA ──
describe('qSOFA', () => {
  it('0 = low risk', () => {
    const r = calcQSOFA([false, false, false]);
    expect(Number(r.value) < 2).toBe(true);
  });

  it('2 = high risk', () => {
    const r = calcQSOFA([true, true, false]);
    expect(Number(r.value) >= 2).toBe(true);
  });
});

// ── NEWS2 boundary ──
describe('NEWS2 boundaries', () => {
  it('score 0 = low', () => {
    const input: NEWS2Input = {
      rr: 0, spo2: 0, copd: false, supplementalO2: false,
      temp: 0, sbp: 0, hr: 0, avpu: 0,
    };
    const r = calcNEWS2(input);
    expect(Number(r.value) < 5).toBe(true);
  });

  it('score 7 = high', () => {
    const input: NEWS2Input = {
      rr: 3, spo2: 2, copd: false, supplementalO2: false,
      temp: 1, sbp: 0, hr: 1, avpu: 0,
    };
    const r = calcNEWS2(input);
    expect(Number(r.value) >= 7).toBe(true);
  });
});

// ── CHA₂DS₂-VASc ──
describe('CHA2DS2-VASc', () => {
  it('all unchecked → 0', () => {
    const input: CHADSInput = {
      chf: false, htn: false, age75: false, dm: false,
      stroke: false, vasc: false, age6574: false, female: false,
    };
    const r = calcCHADS(input);
    expect(r.value).toBe(0);
  });

  it('all checked → 10', () => {
    const input: CHADSInput = {
      chf: true, htn: true, age75: true, dm: true,
      stroke: true, vasc: true, age6574: true, female: true,
    };
    // 1+1+2+1+2+1+1+1 = 10
    const r = calcCHADS(input);
    expect(r.value).toBe(10);
  });
});

// ── Dose calculator ──
describe('Dose calculator', () => {
  it('70kg x 10 mg/kg → 700 mg', () => {
    const r = calcDose(70, 10);
    expect(r.doseMg).toBe(700);
  });

  it('70kg x 5 mcg/kg/min → 21 mg/h', () => {
    const r = calcDose(70, undefined, 5);
    expect(r.infusionMgH).toBe(21);
  });
});
