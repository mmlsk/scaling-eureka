'use client';

export const dynamic = 'force-dynamic';

import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { AIAssistantWidget } from '@/components/ai-assistant/AIAssistantWidget';

export default function AIInsightsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex flex-1 overflow-auto">
          <div className="p-4">
            <h1 className="text-lg font-semibold text-[#e0e0e0] mb-4">
              Spostrzeżenia AI
            </h1>
            <p className="text-xs text-[#888] mb-6">
              Twój osobisty asystent AI. Zadawaj pytania o swoje dane, otrzymuj spostrzeżenia i inteligentne sugestie.
            </p>
            <AIAssistantWidget />
          </div>
        </main>
      </div>
    </div>
  );
}
