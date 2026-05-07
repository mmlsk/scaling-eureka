// lib/queries/use-ai-chat.ts
'use client';

import { useChat } from '@ai-sdk/react';
import type { UseChatHelpers, UIMessage } from '@ai-sdk/react';

export type UseAIchatReturn = UseChatHelpers<UIMessage>;

export function useAIchat(): UseAIchatReturn {
  return useChat({
  });
}
