// Pure TypeScript calculator formulas — no DOM dependencies
// Ported from vanilla app.js (all 22 calculators)

export interface CalcResult {
  value: number | string;
  stage?: string;
  severity?: 'ok' | 'warn' | 'crit';
  interpretation: string;
}

export interface HHResult {
  calcPh: number;
  pfRatio?: number;
  aaGradient?: number;
  anionGap?: number;
  agCorrected?: number;
  deltaDelta?: number;
  disorder: string;
  winterExpected?: number;
  lines: string[];
}

export interface DoseResult {
  doseMg?: number;
  infusionMcgMin?: number;
  infusionMgH?: number;
  rateMlH?: number;
  lines: string[];
}

export interface QTcResult {
  bazett: number;
  fridericia: number;
  framingham: number;
  severity: 'ok' | 'warn' | 'crit';
  level: string;
  interpretation: string;
}

export interface BSResult {
  price: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
  d1: number;
  d2: number;
}

// ── eGFR CKD-EPI 2021 ──
export function calcEGFR(scr: number, age: number, sex: 'M' | 'F'): CalcResult {
  const kappa = sex === 'F' ? 0.7 : 0.9;
  const alpha = sex === 'F' ? -0.241 : -0.302;
  const femFactor = sex === 'F' ? 1.012 : 1;
  const r = scr / kappa;
  const gfr = 142 * Math.pow(Math.min(r, 1), alpha) * Math.pow(Math.max(r, 1), -1.200) * Math.pow(0.9938, age) * femFactor;
  const g = Math.round(gfr);

  let stage: string, severity: 'ok' | 'warn' | 'crit', interpretation: string;
  if (g >= 90) { stage = 'G1'; severity = 'ok'; interpretation = 'Prawidłowe lub wysokie'; }
  else if (g >= 60) { stage = 'G2'; severity = 'ok'; interpretation = 'Łagodnie obniżone'; }
  else if (g >= 45) { stage = 'G3a'; severity = 'warn'; interpretation = 'Łagodnie–umiarkowanie obniżone'; }
  else if (g >= 30) { stage = 'G3b'; severity = 'warn'; interpretation = 'Umiarkowanie–znacznie obniżone'; }
  else if (g >= 15) { stage = 'G4'; severity = 'crit'; interpretation = 'Znacznie obniżone'; }
  else { stage = 'G5'; severity = 'crit'; interpretation = 'Niewydolność nerek'; }

  return { value: g, stage, severity, interpretation };
}

// ── Cockcroft-Gault ──
export function calcCG(scr: number, age: number, wt: number, sex: 'M' | 'F'): CalcResult {
  const crcl = ((140 - age) * wt / (72 * scr)) * (sex === 'F' ? 0.85 : 1);
  const c = Math.round(crcl);

  let stage: string, severity: 'ok' | 'warn' | 'crit', interpretation: string;
  if (c >= 90) { stage = 'Normal'; severity = 'ok'; interpretation = 'Pełna czynność'; }
  else if (c >= 60) { stage = 'Łagodna'; severity = 'ok'; interpretation = 'Dawkowanie standardowe'; }
  else if (c >= 30) { stage = 'Umiarkowana'; severity = 'warn'; interpretation = 'Redukcja dawki wielu leków'; }
  else if (c >= 15) { stage = 'Ciężka'; severity = 'crit'; interpretation = 'Znaczna redukcja dawek'; }
  else { stage = 'Schyłkowa'; severity = 'crit'; interpretation = 'Hemodializa / dializoterapia'; }

  return { value: c, stage, severity, interpretation };
}

// ── CHA₂DS₂-VASc ──
const CHADS_RISK = ['0%', '1.3%', '2.2%', '3.2%', '4.0%', '6.7%', '9.8%', '9.6%', '12.5%', '15.2%'];

export interface CHADSInput {
  chf: boolean;
  htn: boolean;
  age75: boolean;
  dm: boolean;
  stroke: boolean;
  vasc: boolean;
  age6574: boolean;
  female: boolean;
}

export function calcCHADS(input: CHADSInput): CalcResult {
  let s = 0;
  if (input.chf) s += 1;
  if (input.htn) s += 1;
  if (input.age75) s += 2;
  if (input.dm) s += 1;
  if (input.stroke) s += 2;
  if (input.vasc) s += 1;
  if (input.age6574) s += 1;
  if (input.female) s += 1;

  const risk = CHADS_RISK[Math.min(s, 9)];
  let severity: 'ok' | 'warn' | 'crit', rec: string;
  if (s === 0) { severity = 'ok'; rec = 'Brak antykoagulacji'; }
  else if (s === 1 && !input.female) { severity = 'warn'; rec = 'Rozważyć NOAC'; }
  else if (s === 1) { severity = 'ok'; rec = 'Czynnik ryzyka płci'; }
  else { severity = 'crit'; rec = 'NOAC wskazany (ESC)'; }

  const stage = s <= 1 ? 'NISKIE' : s <= 3 ? 'UMIARKOWANE' : 'WYSOKIE';
  return { value: s, stage, severity, interpretation: `${risk} rocz. ryzyko. ${rec}` };
}

// ── GCS ──
export function calcGCS(eye: number, verbal: number, motor: number): CalcResult {
  const total = eye + verbal + motor;
  let severity: 'ok' | 'warn' | 'crit', stage: string, interpretation: string;
  if (total >= 13) { severity = 'ok'; stage = 'ŁAGODNY'; interpretation = 'GCS 13–15'; }
  else if (total >= 9) { severity = 'warn'; stage = 'UMIARKOWANY'; interpretation = 'GCS 9–12'; }
  else { severity = 'crit'; stage = 'CIĘŻKI'; interpretation = 'GCS ≤8 → intubacja'; }

  return { value: total, stage, severity, interpretation };
}

// ── CURB-65 ──
export function calcCURB65(checks: boolean[]): CalcResult {
  const s = checks.filter(Boolean).length;
  let severity: 'ok' | 'warn' | 'crit', stage: string, interpretation: string;
  if (s <= 1) { severity = 'ok'; stage = 'NISKIE'; interpretation = 'Ambulatoryjne. Śm. 1–2%'; }
  else if (s === 2) { severity = 'warn'; stage = 'POŚREDNIE'; interpretation = 'Hospitalizacja. Śm. ~9%'; }
  else { severity = 'crit'; stage = 'WYSOKIE'; interpretation = 'OIT do rozważenia. Śm. ~17–22%'; }

  return { value: s, stage, severity, interpretation };
}

// ── Wells DVT ──
export function calcWellsDVT(checks: boolean[], altDiagnosis: boolean): CalcResult {
  let s = checks.filter(Boolean).length;
  if (altDiagnosis) s -= 2;
  let severity: 'ok' | 'warn' | 'crit', stage: string, interpretation: string;
  if (s < 1) { severity = 'ok'; stage = 'NISKIE'; interpretation = '~3% prawdopodb. DVT. D-dimer i obserwacja.'; }
  else if (s <= 2) { severity = 'warn'; stage = 'POŚREDNIE'; interpretation = '~17% prawdopodb. USG żył.'; }
  else { severity = 'crit'; stage = 'WYSOKIE'; interpretation = '~75% prawdopodb. USG + antykoagulacja.'; }

  return { value: s, stage, severity, interpretation };
}

// ── APGAR ──
export function calcAPGAR(scores: number[]): CalcResult {
  const s = scores.reduce((a, b) => a + b, 0);
  let severity: 'ok' | 'warn' | 'crit', stage: string, interpretation: string;
  if (s >= 7) { severity = 'ok'; stage = 'NORMA'; interpretation = 'Stan dobry. Rutynowe postępowanie.'; }
  else if (s >= 4) { severity = 'warn'; stage = 'UMIARKOWANY'; interpretation = 'Wsparcie oddechowe, ciepło, stymulacja.'; }
  else { severity = 'crit'; stage = 'KRYTYCZNY'; interpretation = 'Natychmiastowa resuscytacja noworodka!'; }

  return { value: s, stage, severity, interpretation };
}

// ── Centor / McIsaac ──
export function calcCentor(checks: boolean[], ageModifier: number): CalcResult {
  let s = checks.filter(Boolean).length;
  s += ageModifier;
  let severity: 'ok' | 'warn' | 'crit', stage: string, interpretation: string;
  if (s <= 0) { severity = 'ok'; stage = 'NISKIE'; interpretation = '<10% GAS. Nie leczyć antybiotykiem.'; }
  else if (s <= 1) { severity = 'ok'; stage = 'NISKIE'; interpretation = '~10% GAS. Obserwacja bez antybiotyku.'; }
  else if (s === 2) { severity = 'warn'; stage = 'POŚREDNIE'; interpretation = '~17–35% GAS. Rozważyć wymazanie gardła.'; }
  else if (s === 3) { severity = 'warn'; stage = 'UMIARKOWANE'; interpretation = '~35–56% GAS. Penicylina V lub amoksy.'; }
  else { severity = 'crit'; stage = 'WYSOKIE'; interpretation = '~52–65% GAS. Antybiotyk empirycznie.'; }

  return { value: s, stage, severity, interpretation };
}

// ── BMI + BSA ──
export interface BMIResult extends CalcResult {
  bsa: number;
}

export function calcBMI(wt: number, ht: number): BMIResult {
  const h = ht / 100;
  const bmi = wt / (h * h);
  const bsa = Math.sqrt((wt * ht) / 3600);

  let severity: 'ok' | 'warn' | 'crit', stage: string, interpretation: string;
  if (bmi < 18.5) { severity = 'warn'; stage = 'Niedowaga'; interpretation = 'BMI<18.5'; }
  else if (bmi < 25) { severity = 'ok'; stage = 'Norma'; interpretation = '18.5–24.9'; }
  else if (bmi < 30) { severity = 'warn'; stage = 'Nadwaga'; interpretation = '25–29.9'; }
  else if (bmi < 35) { severity = 'crit'; stage = 'Otyłość I'; interpretation = '30–34.9'; }
  else if (bmi < 40) { severity = 'crit'; stage = 'Otyłość II'; interpretation = '35–39.9'; }
  else { severity = 'crit'; stage = 'Otyłość III'; interpretation = 'BMI≥40 (chorobliwa)'; }

  return { value: parseFloat(bmi.toFixed(1)), bsa: parseFloat(bsa.toFixed(2)), stage, severity, interpretation };
}

// ── Child-Pugh ──
export function calcChildPugh(scores: number[]): CalcResult {
  const s = scores.reduce((a, b) => a + b, 0);
  let severity: 'ok' | 'warn' | 'crit', stage: string, interpretation: string;
  if (s <= 6) { severity = 'ok'; stage = 'Klasa A'; interpretation = 'Śmiertelność <5% / rok. Dobra rezerwa.'; }
  else if (s <= 9) { severity = 'warn'; stage = 'Klasa B'; interpretation = 'Śmiertelność 20–30% / rok. Umiarkowana.'; }
  else { severity = 'crit'; stage = 'Klasa C'; interpretation = 'Śmiertelność >80% / rok. Zła rezerwa.'; }

  return { value: s, stage, severity, interpretation };
}

// ── Wells PE ──
export function calcWellsPE(checks: boolean[]): CalcResult {
  const s = checks.filter(Boolean).length;
  let severity: 'ok' | 'warn' | 'crit', stage: string, interpretation: string;
  if (s <= 1) { severity = 'ok'; stage = 'NISKIE'; interpretation = 'PE mało prawdopodobna. D-dimer.'; }
  else if (s <= 4) { severity = 'warn'; stage = 'POŚREDNIE'; interpretation = 'PE możliwa. CTPA / V/Q.'; }
  else { severity = 'crit'; stage = 'WYSOKIE'; interpretation = 'PE bardzo prawdopodobna. CTPA natychmiast.'; }

  return { value: s, stage, severity, interpretation };
}

// ── PERC Rule ──
export function calcPERC(checks: boolean[]): CalcResult {
  const met = checks.filter(Boolean).length;
  const allMet = met === checks.length;
  if (allMet) {
    return { value: `${met}/${checks.length}`, stage: 'UJEMNY', severity: 'ok', interpretation: 'Wszystkie spełnione. PE wykluczona klinicznie.' };
  }
  return { value: `${met}/${checks.length}`, stage: 'DODATNI', severity: 'warn', interpretation: 'Nie wszystkie spełnione. Dalsze badania (D-dimer / CTPA).' };
}

// ── MAP (Mean Arterial Pressure) ──
export function calcMAP(sys: number, dia: number): CalcResult {
  const map = Math.round(dia + (sys - dia) / 3);
  let severity: 'ok' | 'warn' | 'crit', stage: string, interpretation: string;
  if (map >= 70 && map <= 105) { severity = 'ok'; stage = 'NORMA'; interpretation = 'Prawidłowe ciśnienie perfuzji.'; }
  else if (map < 70) { severity = 'crit'; stage = 'NISKIE'; interpretation = 'Hipoperfuzja narządowa! Rozważ wazopresory.'; }
  else { severity = 'warn'; stage = 'WYSOKIE'; interpretation = 'Podwyższone MAP. Monitoruj narządy docelowe.'; }

  return { value: map, stage, severity, interpretation };
}

// ── Anion Gap ──
export function calcAnionGap(na: number, cl: number, hco3: number): CalcResult {
  const ag = na - cl - hco3;
  let severity: 'ok' | 'warn' | 'crit', stage: string, interpretation: string;
  if (ag >= 8 && ag <= 12) { severity = 'ok'; stage = 'NORMA'; interpretation = 'Prawidłowa luka anionowa (8–12 mEq/L).'; }
  else if (ag > 12) { severity = 'crit'; stage = 'PODWYŻSZONA'; interpretation = 'Kwasica metaboliczna z podwyższoną AG. MUDPILES.'; }
  else { severity = 'warn'; stage = 'OBNIŻONA'; interpretation = 'Niska AG. Rozważ hipoalbuminemię, zatrucie litem.'; }

  return { value: parseFloat(ag.toFixed(1)), stage, severity, interpretation };
}

// ── Corrected Calcium ──
export function calcCorrectedCa(total: number, alb: number): CalcResult {
  const corrected = total + 0.8 * (4.0 - alb);
  let severity: 'ok' | 'warn' | 'crit', stage: string, interpretation: string;
  if (corrected >= 8.5 && corrected <= 10.5) { severity = 'ok'; stage = 'NORMA'; interpretation = 'Skorygowane Ca w normie (8.5–10.5 mg/dL).'; }
  else if (corrected > 10.5) { severity = 'crit'; stage = 'HIPERKALCEMIA'; interpretation = 'Podwyższone Ca. Rozważ PTH, nowotwór, wit. D.'; }
  else { severity = 'warn'; stage = 'HIPOKALCEMIA'; interpretation = 'Obniżone Ca. Rozważ suplementację, PTH, Mg.'; }

  return { value: parseFloat(corrected.toFixed(2)), stage, severity, interpretation };
}

// ── SOFA Score ──
export function calcSOFA(scores: number[]): CalcResult {
  const s = scores.reduce((a, b) => a + b, 0);
  let severity: 'ok' | 'warn' | 'crit', stage: string, interpretation: string;
  if (s <= 1) { severity = 'ok'; stage = 'NISKIE'; interpretation = 'Śmiertelność <10%.'; }
  else if (s <= 3) { severity = 'ok'; stage = 'NISKIE-ŚR'; interpretation = 'Śmiertelność 15–20%.'; }
  else if (s <= 5) { severity = 'warn'; stage = 'ŚREDNIE'; interpretation = 'Śmiertelność 25–30%.'; }
  else if (s <= 7) { severity = 'warn'; stage = 'WYSOKIE'; interpretation = 'Śmiertelność ~45%.'; }
  else { severity = 'crit'; stage = 'KRYTYCZNE'; interpretation = 'Śmiertelność >50%! Eskalacja leczenia.'; }

  return { value: s, stage, severity, interpretation };
}

// ── qSOFA ──
export function calcQSOFA(checks: boolean[]): CalcResult {
  const s = checks.filter(Boolean).length;
  let severity: 'ok' | 'warn' | 'crit', stage: string, interpretation: string;
  if (s < 2) { severity = 'ok'; stage = 'NISKIE'; interpretation = 'Niskie ryzyko sepsy.'; }
  else { severity = 'crit'; stage = 'WYSOKIE'; interpretation = 'Wg Sepsis-3: podejrzenie sepsy → sprawdź SOFA.'; }

  return { value: s, stage, severity, interpretation };
}

// ── MELD-Na ──
export function calcMELDNa(bil: number, inr: number, cr: number, na: number, dialysis: boolean): CalcResult {
  bil = Math.max(1, bil);
  inr = Math.max(1, inr);
  cr = Math.max(1, cr);
  if (dialysis) cr = 4.0;
  cr = Math.min(cr, 4.0);
  na = Math.max(125, Math.min(137, na));

  let meld = 10 * (0.957 * Math.log(cr) + 0.378 * Math.log(bil) + 1.120 * Math.log(inr) + 0.643);
  meld = Math.min(40, Math.round(meld));

  let meldNa = meld + 1.32 * (137 - na) - (0.033 * meld * (137 - na));
  meldNa = Math.max(6, Math.min(40, Math.round(meldNa)));

  let severity: 'ok' | 'warn' | 'crit', stage: string, interpretation: string;
  if (meldNa <= 9) { severity = 'ok'; stage = 'NISKI'; interpretation = 'Śm. 90d: 1.9%. Niska priorytet transplantacji.'; }
  else if (meldNa <= 19) { severity = 'warn'; stage = 'ŚREDNI'; interpretation = 'Śm. 90d: 6%. Rozważyć kwalifikację.'; }
  else if (meldNa <= 29) { severity = 'warn'; stage = 'WYSOKI'; interpretation = 'Śm. 90d: 19.6%. Priorytet transplantacji.'; }
  else { severity = 'crit'; stage = 'KRYTYCZNY'; interpretation = 'Śm. 90d: 52.6%+. Pilna transplantacja.'; }

  return { value: meldNa, stage, severity, interpretation: `MELD=${meld} | MELD-Na=${meldNa}. ${interpretation}` };
}

// ── NEWS2 ──
export interface NEWS2Input {
  rr: number;
  spo2: number;
  copd: boolean;
  supplementalO2: boolean;
  temp: number;
  sbp: number;
  hr: number;
  avpu: number;
}

export function calcNEWS2(input: NEWS2Input): CalcResult {
  let s = 0;
  s += input.rr;
  if (input.copd) {
    const m: Record<number, number> = { 3: 3, 2: 2, 1: 0, 0: 0 };
    s += m[input.spo2] !== undefined ? m[input.spo2] : input.spo2;
  } else {
    s += input.spo2;
  }
  if (input.supplementalO2) s += 2;
  s += input.temp;
  s += input.sbp;
  s += input.hr;
  s += input.avpu;

  const vals = [input.rr, input.spo2, input.temp, input.sbp, input.hr, input.avpu];
  const has3 = vals.some(v => v >= 3);

  let severity: 'ok' | 'warn' | 'crit', stage: string, interpretation: string;
  if (s >= 7) { severity = 'crit'; stage = 'WYSOKIE'; interpretation = 'Pilna eskalacja! Zespół resuscytacyjny.'; }
  else if (s >= 5 || has3) { severity = 'warn'; stage = 'ŚREDNIE'; interpretation = 'Pilna ocena — rozważ OIT.'; }
  else { severity = 'ok'; stage = 'NISKIE'; interpretation = 'Rutynowa obserwacja.'; }

  return { value: s, stage, severity, interpretation };
}

// ── Henderson-Hasselbalch ──
export interface HHInput {
  ph: number;
  pco2: number;
  hco3: number;
  pao2?: number;
  fio2?: number;
  na?: number;
  cl?: number;
  alb?: number;
}

export function calcHH(input: HHInput): HHResult {
  const { ph, pco2, hco3, pao2, fio2, na, cl, alb } = input;
  const lines: string[] = [];
  const calcPh = 6.1 + Math.log10(hco3 / (0.03 * pco2));
  lines.push(`pH obliczone: ${calcPh.toFixed(2)}`);

  const result: HHResult = { calcPh, disorder: '', lines };

  if (pao2 && fio2) {
    const pf = pao2 / (fio2 / 100);
    result.pfRatio = pf;
    lines.push(`P/F ratio: ${pf.toFixed(0)}${pf < 200 ? ' (ciężki ARDS)' : pf < 300 ? ' (ARDS)' : ' (norma)'}`);
    const aa = (fio2 / 100 * (760 - 47)) - (pco2 / 0.8) - pao2;
    result.aaGradient = aa;
    lines.push(`A-a gradient: ${aa.toFixed(1)} mmHg${aa > 15 ? ' ↑' : ''}`);
  }

  if (na && cl) {
    const ag = na - cl - hco3;
    result.anionGap = ag;
    lines.push(`Anion Gap: ${ag.toFixed(1)}${ag > 12 ? ' ↑' : ''}`);
    if (alb) {
      const agc = ag + 2.5 * (4.0 - alb);
      result.agCorrected = agc;
      lines.push(`AG korygowany: ${agc.toFixed(1)}`);
    }
    if (ag > 12) {
      const dd = (ag - 12) / (24 - hco3);
      result.deltaDelta = dd;
      lines.push(`Delta-delta: ${dd.toFixed(2)}${dd > 2 ? ' (zasadowica met.)' : dd < 1 ? ' (non-AG acidosis+)' : ''}`);
    }
  }

  let disorder = '';
  if (ph < 7.35) {
    disorder = hco3 < 22 ? 'Kwasica metaboliczna' : 'Kwasica oddechowa';
    if (hco3 < 22) {
      const expPco2 = 1.5 * hco3 + 8;
      result.winterExpected = expPco2;
      lines.push(`Winter: PaCO₂ ocz.=${expPco2.toFixed(0)}±2${pco2 < expPco2 - 2 ? ' +oddech. komp.' : pco2 > expPco2 + 2 ? ' +oddech. kwasica' : ''}`);
    }
  } else if (ph > 7.45) {
    disorder = hco3 > 26 ? 'Zasadowica metaboliczna' : 'Zasadowica oddechowa';
  } else {
    disorder = 'Norma (7.35–7.45)';
  }
  result.disorder = disorder;
  lines.push(disorder);

  return result;
}

// ── Dose Calculator ──
export function calcDose(wt: number, mgkg?: number, mcgkgmin?: number, conc?: number): DoseResult {
  const lines: string[] = [];
  const result: DoseResult = { lines };

  if (mgkg) {
    const dose = wt * mgkg;
    result.doseMg = dose;
    lines.push(`Dawka: ${dose.toFixed(1)} mg`);
  }

  if (mcgkgmin) {
    const mcgMin = wt * mcgkgmin;
    const mgH = mcgMin * 60 / 1000;
    result.infusionMcgMin = mcgMin;
    result.infusionMgH = mgH;
    lines.push(`Wlew: ${mcgMin.toFixed(1)} mcg/min`);
    lines.push(`      ${mgH.toFixed(2)} mg/h`);
    if (conc) {
      const mlH = mgH / conc;
      result.rateMlH = mlH;
      lines.push(`Prędkość: ${mlH.toFixed(1)} mL/h`);
    }
  }

  if (!lines.length) lines.push('Podaj dawkę mg/kg lub mcg/kg/min');

  return result;
}

// ── QTc (Bazett / Fridericia / Framingham) ──
export function calcQTc(qt: number, hr: number): QTcResult {
  const rr = 60 / hr;
  const bazett = qt / Math.sqrt(rr);
  const fridericia = qt / Math.cbrt(rr);
  const framingham = qt + 154 * (1 - rr);

  let severity: 'ok' | 'warn' | 'crit', level: string, interpretation: string;
  if (bazett > 500) { severity = 'crit'; level = 'KRYTYCZNY'; interpretation = 'QTc>500ms — ryzyko TdP!'; }
  else if (bazett > 470) { severity = 'warn'; level = 'WYDŁUŻONY'; interpretation = 'QTc wydłużony (>470ms ♀).'; }
  else if (bazett > 450) { severity = 'warn'; level = 'GRANICZNY'; interpretation = 'QTc graniczny (>450ms ♂).'; }
  else { severity = 'ok'; level = 'NORMA'; interpretation = 'QTc w normie.'; }

  return {
    bazett: Math.round(bazett),
    fridericia: Math.round(fridericia),
    framingham: Math.round(framingham),
    severity, level, interpretation,
  };
}

// ── NIHSS (National Institutes of Health Stroke Scale) ──
export function calcNIHSS(scores: number[]): CalcResult {
  const s = scores.reduce((a, b) => a + b, 0);
  let severity: 'ok' | 'warn' | 'crit', stage: string, interpretation: string;
  if (s === 0) { severity = 'ok'; stage = 'BEZ DEFICYTU'; interpretation = 'Brak deficytu neurologicznego.'; }
  else if (s <= 4) { severity = 'ok'; stage = 'ŁAGODNY'; interpretation = 'Łagodny udar. Rokowanie dobre.'; }
  else if (s <= 15) { severity = 'warn'; stage = 'UMIARKOWANY'; interpretation = 'Umiarkowany udar. Rozważ trombolizę.'; }
  else if (s <= 20) { severity = 'crit'; stage = 'CIĘŻKI'; interpretation = 'Ciężki udar. Tromboliza / trombektomia.'; }
  else { severity = 'crit'; stage = 'BARDZO CIĘŻKI'; interpretation = 'Bardzo ciężki udar. Trombektomia pilna.'; }

  return { value: s, stage, severity, interpretation };
}

// ── ABCD² Score (TIA risk) ──
export interface ABCD2Input {
  age60: boolean;
  bpHigh: boolean;
  clinicalUnilateral: boolean;
  clinicalSpeech: boolean;
  duration60: boolean;
  duration10to59: boolean;
  diabetes: boolean;
}

export function calcABCD2(input: ABCD2Input): CalcResult {
  let s = 0;
  if (input.age60) s += 1;
  if (input.bpHigh) s += 1;
  if (input.clinicalUnilateral) s += 2;
  else if (input.clinicalSpeech) s += 1;
  if (input.duration60) s += 2;
  else if (input.duration10to59) s += 1;
  if (input.diabetes) s += 1;

  let severity: 'ok' | 'warn' | 'crit', stage: string, interpretation: string;
  if (s <= 3) { severity = 'ok'; stage = 'NISKIE'; interpretation = 'Niskie ryzyko udaru 2d: ~1%. Obserwacja ambulatoryjna.'; }
  else if (s <= 5) { severity = 'warn'; stage = 'UMIARKOWANE'; interpretation = 'Umiarkowane ryzyko 2d: ~4%. Hospitalizacja do rozważenia.'; }
  else { severity = 'crit'; stage = 'WYSOKIE'; interpretation = 'Wysokie ryzyko 2d: ~8%. Pilna hospitalizacja.'; }

  return { value: s, stage, severity, interpretation };
}

// ── Black-Scholes ──
function erf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return x >= 0 ? y : -y;
}

function normalCDF(x: number): number {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

export function calcBlackScholes(S: number, K: number, T: number, r: number, sigma: number, type: 'call' | 'put'): BSResult | null {
  if (T <= 0 || sigma <= 0 || S <= 0 || K <= 0) return null;
  const Ty = T / 365;
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * Ty) / (sigma * Math.sqrt(Ty));
  const d2 = d1 - sigma * Math.sqrt(Ty);
  const isC = type === 'call';

  const price = isC
    ? S * normalCDF(d1) - K * Math.exp(-r * Ty) * normalCDF(d2)
    : K * Math.exp(-r * Ty) * normalCDF(-d2) - S * normalCDF(-d1);
  const delta = isC ? normalCDF(d1) : normalCDF(d1) - 1;
  const gamma = normalPDF(d1) / (S * sigma * Math.sqrt(Ty));
  const theta = isC
    ? (-(S * normalPDF(d1) * sigma) / (2 * Math.sqrt(Ty)) - r * K * Math.exp(-r * Ty) * normalCDF(d2)) / 365
    : (-(S * normalPDF(d1) * sigma) / (2 * Math.sqrt(Ty)) + r * K * Math.exp(-r * Ty) * normalCDF(-d2)) / 365;
  const vega = S * normalPDF(d1) * Math.sqrt(Ty) / 100;
  const rho = isC
    ? K * Ty * Math.exp(-r * Ty) * normalCDF(d2) / 100
    : -K * Ty * Math.exp(-r * Ty) * normalCDF(-d2) / 100;

  return { price, delta, gamma, theta, vega, rho, d1, d2 };
}
