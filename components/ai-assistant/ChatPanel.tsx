'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './MessageBubble';

export function ChatPanel() {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/ai/chat' }),
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector(
        '[data-slot="scroll-area-viewport"]'
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && status === 'ready') {
      sendMessage({ text: input });
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <ScrollArea ref={scrollRef} className="flex-1 px-3 py-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground text-center px-4">
            <div>
              <p className="mb-1">Witaj! Jestem Twoim asystentem AI.</p>
              <p>Zadaj mi pytanie o Twoje nawyki, zadania czy cele zdrowotne.</p>
            </div>
          </div>
        ) : (
          <div>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {((status as string) === 'streaming' || status === 'submitted') && (
              <div className="flex justify-start mb-3">
                <div className="bg-muted text-muted-foreground rounded-lg rounded-bl-sm px-3 py-2 text-sm flex items-center gap-2">
                  <span className="animate-pulse">{status === 'submitted' ? 'AI myśli...' : 'AI pisze...'}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Error state */}
      {error && (
        <div className="px-3 py-1.5 text-xs text-destructive bg-destructive/10">
          Błąd: {error.message || 'Wystąpił problem z komunikacją'}
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-[var(--bor)] p-2">
        <form onSubmit={handleSubmit} className="flex gap-2" aria-label="Chat z asystentem AI">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Napisz wiadomość..."
            disabled={(status as string) === 'streaming' || status === 'submitted'}
            className="text-sm"
            aria-label="Wiadomość dla asystenta AI"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          {(status as string) === 'streaming' ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={stop}
            >
              Stop
            </Button>
          ) : (
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim() || status === 'streaming' || status === 'submitted'}
            >
              Wyślij
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
