'use client';

import { useAIAssistantUIStore } from '@/store/slices/ai-assistant-ui';
import { useAIchat } from '@/lib/queries/use-ai-chat';
import type { UIMessage } from 'ai';

export function AIAssistantWidget() {
  const { messages, sendMessage, status } = useAIchat();
  const isOpen = useAIAssistantUIStore((s) => s.isOpen);
  const activeTab = useAIAssistantUIStore((s) => s.activeTab);
  const setOpen = useAIAssistantUIStore((s) => s.setOpen);
  const setActiveTab = useAIAssistantUIStore((s) => s.setActiveTab);

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-screen w-[400px] bg-[#1e1e2e] border-l border-[var(--bor)] flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[var(--bor)]">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`text-xs px-2 py-1 rounded ${activeTab === 'chat' ? 'bg-[#2a2a3e] text-[#e0e0e0]' : 'text-[#888]'}`}
          >
            Chat
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('insights')}
            className={`text-xs px-2 py-1 rounded ${activeTab === 'insights' ? 'bg-[#2a2a3e] text-[#e0e0e0]' : 'text-[#888]'}`}
          >
            Insights
          </button>
        </div>
        <button type="button" onClick={() => setOpen(false)} className="text-[#888] hover:text-[#e0e0e0]">
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'chat' ? (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-2">
              {messages.map((m: UIMessage, i: number) => (
                <div key={i} className={`text-xs ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <span className={`inline-block p-2 rounded ${m.role === 'user' ? 'bg-[#2a2a3e] text-[#e0e0e0]' : 'bg-[#151522]'}`}>
                    {m.role === 'user' ? 'You: ' : 'AI: '}
                    {m.parts?.map((p, j) => (
                      <span key={j}>{p.type === 'text' ? p.text : ''}</span>
                    ))}
                  </span>
                </div>
              ))}
              {status === 'streaming' && <div className="text-xs text-[#888]">AI is typing...</div>}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const input = (e.target as HTMLFormElement).querySelector('input') as HTMLInputElement;
                if (input?.value) {
                  sendMessage({ role: 'user', parts: [{ type: 'text', text: input.value }] });
                  input.value = '';
                }
              }}
              className="flex gap-2 mt-2"
            >
              <input
                type="text"
                placeholder="Ask something..."
                className="flex-1 px-2 py-1 text-xs bg-[#151522] border border-[#2a2a3e] rounded"
              />
              <button type="submit" className="px-3 py-1 text-xs bg-[#fb923c] text-black rounded">
                Send
              </button>
            </form>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-[#888]">
            Insights panel — coming soon
          </div>
        )}
      </div>
    </div>
  );
}
