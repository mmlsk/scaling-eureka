'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WidgetShell } from '@/components/ui/widget-shell';
import { ChatPanel } from './ChatPanel';
import { InsightsPanel } from './InsightsPanel';
import { MessageSquare, Lightbulb } from 'lucide-react';

export function AIAssistantWidget() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <WidgetShell
      id="ai-assistant"
      title="Asystent AI"
      className="h-[500px] flex flex-col"
    >
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col h-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat" className="text-xs gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="insights" className="text-xs gap-1">
            <Lightbulb className="h-3.5 w-3.5" />
            Spostrzeżenia
          </TabsTrigger>
        </TabsList>
        <TabsContent value="chat" className="flex-1 mt-0 overflow-hidden">
          <ChatPanel />
        </TabsContent>
        <TabsContent value="insights" className="flex-1 mt-0 overflow-hidden">
          <InsightsPanel />
        </TabsContent>
      </Tabs>
    </WidgetShell>
  );
}
