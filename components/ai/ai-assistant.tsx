// components/ai/ai-assistant.tsx
'use client';

import { useAIAssistantUIStore } from '@/store/slices/ai-assistant-ui';
import { useAIChat } from '@/lib/queries/use-ai-chat';
import { useAIInsights } from '@/lib/queries/use-ai-insights';
import { Button } from '@/components/ui/button';

export default function AIAssistant() {
  const isOpen = useAIAssistantUIStore((s) => s.isOpen);
  const activeTab = useAIAssistantUIStore((s) => s.activeTab);
  const setOpen = useAIAssistantUIStore((s) => s.setOpen);
  const setActiveTab = useAIAssistantUIStore((s) => s.setActiveTab);
  const sidebarWidth = useAIAssistantUIStore((s) => s.sidebarWidth);

  if (!isOpen) return null;

  return (
    <div
      style={{
        width: sidebarWidth,
        borderLeft: '1px solid var(--border)',
        background: 'var(--background)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 1rem', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>AI Assistant</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
          aria-label="Close AI Assistant"
        >
          ✕
        </button>
      </div>

      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)' }}>
        {(['chat', 'insights'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '0.5rem',
              background: activeTab === tab ? 'var(--primary)' : 'transparent',
              color: activeTab === tab ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
          >
            {tab === 'chat' ? 'Chat' : 'Insights'}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0.5rem' }}>
        {activeTab === 'chat' ? <ChatPanel /> : <InsightsPanel />}
      </div>
    </div>
  );
}

function ChatPanel() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useAIChat();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '0.5rem' }}>
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              marginBottom: '0.5rem',
              textAlign: m.role === 'user' ? 'right' : 'left',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                background: m.role === 'user' ? 'var(--primary)' : 'var(--muted)',
                color: m.role === 'user' ? 'var(--primary-foreground)' : 'var(--foreground)',
                fontSize: '0.8rem',
                maxWidth: '80%',
              }}
            >
              {m.content}
            </span>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(e);
        }}
        style={{ display: 'flex', gap: '0.5rem' }}
      >
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask me anything..."
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '0.5rem',
            border: '1px solid var(--border)',
            borderRadius: '0.375rem',
            fontSize: '0.8rem',
            background: 'var(--background)',
            color: 'var(--foreground)',
          }}
        />
        <Button type="submit" disabled={isLoading} style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}>
          Send
        </Button>
      </form>
    </div>
  );
}

function InsightsPanel() {
  const { data: insights, isLoading, error } = useAIInsights();

  if (isLoading) return <div style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>Loading insights...</div>;
  if (error) return <div style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--destructive)' }}>Failed to load insights</div>;
  if (!insights?.length) return <div style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>No insights yet</div>;

  return (
    <div>
      {insights.map((insight) => (
        <div key={insight.id} style={{ marginBottom: '0.75rem', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{insight.title}</span>
            <span
              style={{
                fontSize: '0.65rem',
                padding: '0.125rem 0.375rem',
                borderRadius: '9999px',
                background: insight.priority === 'high' ? 'var(--destructive)' : insight.priority === 'medium' ? 'var(--primary)' : 'var(--secondary)',
                color: insight.priority === 'high' ? 'var(--destructive-foreground)' : insight.priority === 'medium' ? 'var(--primary-foreground)' : 'var(--secondary-foreground)',
              }}
            >
              {insight.priority}
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', margin: 0 }}>{insight.description}</p>
        </div>
      ))}
    </div>
  );
}
