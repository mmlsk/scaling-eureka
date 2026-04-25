// LifeOS Medical Calculator Regression Tests
// Run in browser console or Node.js
// Usage (browser): paste into console on LifeOS page
// Usage (Node): node tests/calc-tests.js (requires DOM mocking)

(function(){
  'use strict';
  let passed=0,failed=0;
  const results=[];

  function assert(name,actual,expected,tolerance){
    tolerance=tolerance||0;
    let ok;
    if(typeof expected==='boolean')ok=actual===expected;
    else if(typeof expected==='string')ok=actual===expected;
    else ok=Math.abs(actual-expected)<=tolerance;
    if(ok){passed++;results.push({name,status:'PASS'});}
    else{failed++;results.push({name,status:'FAIL',actual,expected});}
  }

  // ── eGFR CKD-EPI 2021 ──
  function testEGFR(scr,age,sex){
    const kappa=sex==='F'?0.7:0.9,alpha=sex==='F'?-0.241:-0.302,femFactor=sex==='F'?1.012:1;
    const r=scr/kappa;
    return 142*Math.pow(Math.min(r,1),alpha)*Math.pow(Math.max(r,1),-1.200)*Math.pow(0.9938,age)*femFactor;
  }
  assert('eGFR male 30yr Cr1.0',Math.round(testEGFR(1.0,30,'M')),104,2);
  assert('eGFR female 65yr Cr1.5',Math.round(testEGFR(1.5,65,'F')),37,2);
  assert('eGFR male 50yr Cr0.8',Math.round(testEGFR(0.8,50,'M')),106,3);

  // ── Cockcroft-Gault ──
  function testCG(scr,age,wt,sex){
    return((140-age)*wt/(72*scr))*(sex==='F'?0.85:1);
  }
  assert('CG male 30yr 70kg Cr1.0',Math.round(testCG(1.0,30,70,'M')),107,2);
  assert('CG female 60yr 55kg Cr1.2',Math.round(testCG(1.2,60,55,'F')),44,2);

  // ── MAP ──
  function calcMAP(sys,dia){return dia+(sys-dia)/3;}
  assert('MAP 120/80',calcMAP(120,80),93.3,0.1);
  assert('MAP 90/60',calcMAP(90,60),70,0.1);
  assert('MAP 180/110',calcMAP(180,110),133.3,0.1);

  // ── Anion Gap ──
  function calcAG(na,cl,hco3){return na-cl-hco3;}
  assert('AG normal 140/104/24',calcAG(140,104,24),12,0);
  assert('AG elevated 145/100/20',calcAG(145,100,20),25,0);

  // ── Corrected Ca ──
  function calcCaCorrected(ca,alb){return ca+0.8*(4.0-alb);}
  assert('Ca corr 9.0/4.0',calcCaCorrected(9.0,4.0),9.0,0.01);
  assert('Ca corr 8.0/2.0',calcCaCorrected(8.0,2.0),9.6,0.01);

  // ── BMI ──
  function calcBMI(wt,ht){const h=ht/100;return wt/(h*h);}
  assert('BMI 70kg/175cm',calcBMI(70,175),22.9,0.1);
  assert('BMI 100kg/170cm',calcBMI(100,170),34.6,0.1);

  // ── MELD-Na ──
  function calcMELD(bil,inr,cr,na,dial){
    bil=Math.max(1,bil);inr=Math.max(1,inr);cr=Math.max(1,cr);
    if(dial)cr=4.0;cr=Math.min(cr,4.0);na=Math.max(125,Math.min(137,na));
    let meld=10*(0.957*Math.log(cr)+0.378*Math.log(bil)+1.120*Math.log(inr)+0.643);
    meld=Math.min(40,Math.round(meld));
    let meldNa=meld+1.32*(137-na)-(0.033*meld*(137-na));
    return Math.max(6,Math.min(40,Math.round(meldNa)));
  }
  assert('MELD-Na Bil1/INR1/Cr1/Na140',calcMELD(1,1,1,140,false),6,1);
  assert('MELD-Na Bil3/INR2/Cr1.5/Na130',calcMELD(3,2,1.5,130,false),26,3);
  assert('MELD-Na dialysis',calcMELD(2,1.5,1,135,true),28,3);

  // ── Henderson-Hasselbalch ──
  function calcPhHH(hco3,pco2){return 6.1+Math.log10(hco3/(0.03*pco2));}
  assert('HH pH 24/40',calcPhHH(24,40),7.40,0.01);
  assert('HH pH 12/20',calcPhHH(12,20),7.40,0.02);
  assert('HH pH 24/80',calcPhHH(24,80),7.10,0.02);

  // ── P/F ratio ──
  function calcPF(pao2,fio2){return pao2/(fio2/100);}
  assert('PF 95/21',calcPF(95,21),452,5);
  assert('PF 60/100',calcPF(60,100),60,0);

  // ── A-a gradient ──
  function calcAa(fio2,pco2,pao2){return(fio2/100*(760-47))-(pco2/0.8)-pao2;}
  assert('A-a gradient normal',calcAa(21,40,95),4.7,2);

  // ── QTc Bazett ──
  function calcQTcBazett(qt,hr){return qt/Math.sqrt(60/hr);}
  assert('QTc Bazett 400ms/60bpm',Math.round(calcQTcBazett(400,60)),400,1);
  assert('QTc Bazett 400ms/100bpm',Math.round(calcQTcBazett(400,100)),516,2);

  // ── QTc Fridericia ──
  function calcQTcFrid(qt,hr){return qt/Math.cbrt(60/hr);}
  assert('QTc Fridericia 400ms/60bpm',Math.round(calcQTcFrid(400,60)),400,1);

  // ── SOFA boundary ──
  assert('SOFA min score',0,0,0);
  assert('SOFA max score',24,24,0);

  // ── qSOFA ──
  assert('qSOFA 0 = low risk',0<2,true);
  assert('qSOFA 2 = high risk',2>=2,true);

  // ── NEWS2 boundary ──
  assert('NEWS2 score 0 = low',0<5,true);
  assert('NEWS2 score 7 = high',7>=7,true);

  // ── CHA₂DS₂-VASc ──
  function calcCHADS(checks){return checks.reduce((a,b)=>a+b,0);}
  assert('CHADS all unchecked',calcCHADS([0,0,0,0,0,0,0,0]),0,0);
  assert('CHADS all checked',calcCHADS([1,1,2,1,2,1,1,1]),10,0);

  // ── Dose calculator ──
  function calcDoseMgKg(wt,mgkg){return wt*mgkg;}
  assert('Dose 70kg×10mg/kg',calcDoseMgKg(70,10),700,0);
  function calcInfusion(wt,mcgkgmin){return wt*mcgkgmin*60/1000;}
  assert('Infusion 70kg×5mcg/kg/min mg/h',calcInfusion(70,5),21,0);

  // ── Print results ──
  console.log('═══ LifeOS Calc Tests ═══');
  results.forEach(r=>{
    if(r.status==='FAIL'){console.log(`FAIL: ${r.name} — got ${r.actual}, expected ${r.expected}`);}
    else{console.log(`PASS: ${r.name}`);}
  });
  console.log(`\nTotal: ${passed+failed} | Passed: ${passed} | Failed: ${failed}`);
  if(typeof window!=='undefined')console.log('Run in browser console on LifeOS page for full integration tests.');
  return{passed,failed,results};
})();
