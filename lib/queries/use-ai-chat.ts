// lib/queries/use-ai-chat.ts
'use client';

import { useChat } from '@ai-sdk/react';
import type { Message } from 'ai';

export interface UseAIChatReturn {
  messages: Message[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  append: (message: { role: 'user'; content: string }) => void;
}

export function useAIChat(): UseAIChatReturn {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    append,
  } = useChat({
    api: '/api/ai/chat',
    initialMessages: [],
  });

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    append,
  };
}
