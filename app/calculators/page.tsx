'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { CalcCard } from './_components/calc-card';
import { CALC_VERSIONS } from '@/lib/calculators/versions';

type TabId = 'cardio' | 'neuro' | 'pulm' | 'oiom' | 'ped' | 'inne';

const CALC_COMPONENTS: Record<string, React.ComponentType> = {
  'CHADS': dynamic(() => import('./_components/cardio/chads-calc')),
  'MAP': dynamic(() => import('./_components/inne/map-calc')),
  'QTc': dynamic(() => import('./_components/cardio/qtc-calc')),
  'Wells-PE': dynamic(() => import('./_components/pulm/wells-pe-calc')),
  'Wells-DVT': dynamic(() => import('./_components/pulm/wells-dvt-calc')),
  'PERC': dynamic(() => import('./_components/pulm/perc-calc')),
  'GCS': dynamic(() => import('./_components/neuro/gcs-calc')),
  'NIHSS': dynamic(() => import('./_components/neuro/nihss-calc')),
  'ABCD2': dynamic(() => import('./_components/neuro/abcd2-calc')),
  'CURB-65': dynamic(() => import('./_components/pulm/curb65-calc')),
  'NEWS2': dynamic(() => import('./_components/oiom/news2-calc')),
  'SOFA': dynamic(() => import('./_components/oiom/sofa-calc')),
  'qSOFA': dynamic(() => import('./_components/oiom/qsofa-calc')),
  'Henderson-Hasselbalch': dynamic(() => import('./_components/oiom/hh-calc')),
  'AG': dynamic(() => import('./_components/inne/ag-calc')),
  'Ca-corr': dynamic(() => import('./_components/inne/ca-calc')),
  'Dose': dynamic(() => import('./_components/oiom/dose-calc')),
  'APGAR': dynamic(() => import('./_components/ped/apgar-calc')),
  'eGFR': dynamic(() => import('./_components/inne/egfr-calc')),
  'CG': dynamic(() => import('./_components/inne/cg-calc')),
  'BMI': dynamic(() => import('./_components/inne/bmi-calc')),
  'Child-Pugh': dynamic(() => import('./_components/inne/child-pugh-calc')),
  'MELD-Na': dynamic(() => import('./_components/inne/meld-calc')),
  'Centor': dynamic(() => import('./_components/ped/centor-calc')),
};

interface TabDef {
  id: TabId;
  label: string;
}

const TABS: TabDef[] = [
  { id: 'cardio', label: 'Cardio' },
  { id: 'neuro', label: 'Neuro' },
  { id: 'pulm', label: 'Pulm' },
  { id: 'oiom', label: 'OIOM' },
  { id: 'ped', label: 'Ped' },
  { id: 'inne', label: 'Inne' },
];

interface CalcEntry {
  key: string;
  title: string;
  tab: TabId;
}

const CALCULATOR_LIST: CalcEntry[] = [
  // Cardio
  { key: 'CHADS', title: 'CHA\u2082DS\u2082-VASc', tab: 'cardio' },
  { key: 'MAP', title: 'Mean Arterial Pressure', tab: 'cardio' },
  { key: 'QTc', title: 'QTc (Bazett/Fridericia)', tab: 'cardio' },
  { key: 'Wells-PE', title: 'Wells PE Score', tab: 'cardio' },
  { key: 'Wells-DVT', title: 'Wells DVT Score', tab: 'cardio' },
  { key: 'PERC', title: 'PERC Rule', tab: 'cardio' },

  // Neuro
  { key: 'GCS', title: 'Glasgow Coma Scale', tab: 'neuro' },
  { key: 'NIHSS', title: 'NIHSS (Stroke)', tab: 'neuro' },
  { key: 'ABCD2', title: 'ABCD\u00B2 (TIA Risk)', tab: 'neuro' },

  // Pulm
  { key: 'CURB-65', title: 'CURB-65 (Pneumonia)', tab: 'pulm' },
  { key: 'NEWS2', title: 'NEWS2', tab: 'pulm' },

  // OIOM
  { key: 'SOFA', title: 'SOFA Score', tab: 'oiom' },
  { key: 'qSOFA', title: 'qSOFA', tab: 'oiom' },
  { key: 'Henderson-Hasselbalch', title: 'Henderson-Hasselbalch', tab: 'oiom' },
  { key: 'AG', title: 'Anion Gap', tab: 'oiom' },
  { key: 'Ca-corr', title: 'Corrected Calcium', tab: 'oiom' },
  { key: 'Dose', title: 'Dose Calculator', tab: 'oiom' },

  // Ped
  { key: 'APGAR', title: 'APGAR Score', tab: 'ped' },

  // Inne
  { key: 'eGFR', title: 'eGFR (CKD-EPI 2021)', tab: 'inne' },
  { key: 'CG', title: 'Cockcroft-Gault', tab: 'inne' },
  { key: 'BMI', title: 'BMI / BSA', tab: 'inne' },
  { key: 'Child-Pugh', title: 'Child-Pugh', tab: 'inne' },
  { key: 'MELD-Na', title: 'MELD-Na', tab: 'inne' },
  { key: 'Centor', title: 'Centor / McIsaac', tab: 'inne' },
];

export default function CalculatorsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('cardio');

  const filteredCalcs = CALCULATOR_LIST.filter((c) => c.tab === activeTab);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <main style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
          {/* Tab bar */}
          <div
            style={{
              display: 'flex',
              gap: '0.25rem',
              marginBottom: '1rem',
              borderBottom: '1px solid var(--bor)',
              paddingBottom: '0.5rem',
              flexWrap: 'wrap',
            }}
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-label={`Przełącz na zakładkę: ${tab.label}`}
                style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: '6px 6px 0 0',
                  border: 'none',
                  background:
                    activeTab === tab.id ? 'var(--a1d)' : 'transparent',
                  color:
                    activeTab === tab.id ? 'var(--a1)' : 'var(--txm)',
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  fontSize: 'clamp(0.6rem, 0.58rem + 0.12vw, 0.72rem)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: 'inherit',
                  borderBottom:
                    activeTab === tab.id
                      ? '2px solid var(--a1)'
                      : '2px solid transparent',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Calculator grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {filteredCalcs.map((calc) => {
              const meta = CALC_VERSIONS[calc.key];
              const CalcComponent = CALC_COMPONENTS[calc.key];
              return (
                <CalcCard
                  key={calc.key}
                  title={calc.title}
                  version={meta?.version ?? 'std'}
                  formula={meta?.formula ?? calc.key}
                >
                  {CalcComponent ? <CalcComponent /> : <div style={{ color: 'var(--txm)', fontStyle: 'italic' }}>Coming soon...</div>}
                </CalcCard>
              );
            })}
          </div>

          {filteredCalcs.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '2rem',
                color: 'var(--txm)',
                fontSize: 'clamp(0.6rem, 0.58rem + 0.12vw, 0.72rem)',
              }}
            >
              No calculators in this category yet.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
