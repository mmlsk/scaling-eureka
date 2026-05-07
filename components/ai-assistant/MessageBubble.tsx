'use client';

import type { UIMessage } from 'ai';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface MessageBubbleProps {
  message: UIMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex w-full mb-3',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-3 py-2 text-sm',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-muted text-muted-foreground rounded-bl-sm'
        )}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <Badge
            variant={isUser ? 'default' : 'secondary'}
            className="text-[10px] px-1.5 py-0 h-4"
          >
            {isUser ? 'Ty' : 'AI'}
          </Badge>
        </div>
        <div className="space-y-1">
          {message.parts.map((part, i) => {
            if (part.type === 'text') {
              return (
                <p key={`${message.id}-text-${i}`} className="leading-relaxed">
                  {part.text}
                </p>
              );
            }
            if (part.type === 'reasoning') {
              return (
                <details
                  key={`${message.id}-reasoning-${i}`}
                  className="text-xs opacity-70"
                >
                  <summary className="cursor-pointer">Pokaż myślenie</summary>
                  <pre className="mt-1 whitespace-pre-wrap">{part.text}</pre>
                </details>
              );
            }
            if (part.type.startsWith('tool-')) {
              return (
                <div
                  key={`${message.id}-tool-${i}`}
                  className="text-xs opacity-60 italic"
                >
                  Użyto narzędzia: {part.type.replace('tool-', '')}
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}
