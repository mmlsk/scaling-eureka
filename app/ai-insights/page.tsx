'use client';

import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { AIAssistantWidget } from '@/components/ai-assitant/ai-assitant-widget';

export default function AIInsightsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <main style={{ flex: 1, overflow: 'auto' }}>
          <div className="p-4">
            <h1 className="text-lg font-semibold text-[#e0e0e0] mb-4">
              AI Insights
            </h1>
            <p className="text-xs text-[#888] mb-6">
              Your personal AI assistant. Ask questions about your data, get insights, and receive smart suggestions.
            </p>
            <div className="h-[600px]">
              <AIAssistantWidget />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
