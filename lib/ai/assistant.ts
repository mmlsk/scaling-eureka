import type { SupabaseClient } from '@supabase/supabase-js';
import type { AIAssistantResponse } from '@/types/api';
import type { SimilarityResult } from './embeddings';
import { generateEmbedding, searchSimilar } from './embeddings';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

// ── Context Item ──
interface ContextItem {
  type: string;
  content: string;
  similarity: number;
}

/**
 * Build a system prompt enriched with the user's life data context.
 */
export function buildContextPrompt(
  context: ContextItem[],
  userMessage: string,
): string {
  const contextSection = context.length > 0
    ? context
        .map((item, i) => `[${i + 1}] (${item.type}, relevance: ${(item.similarity * 100).toFixed(0)}%)\n${item.content}`)
        .join('\n\n')
    : 'No relevant context found in user data.';

  return `You are a helpful personal AI assistant integrated into a life dashboard application.
You have access to the user's personal data context (notes, todos, habits, mood entries) to provide personalized responses.
Always respond in the same language the user uses. If the context is in Polish, respond in Polish.
Be concise, helpful, and reference specific data from the context when relevant.

## User's Relevant Data Context:
${contextSection}

## User's Question:
${userMessage}

Provide a helpful, personalized response based on the context above. If the context doesn't contain relevant information, answer based on your general knowledge but mention that you don't have specific data about that topic in the user's records.`;
}

/**
 * Process an AI assistant query: embed the question, search for relevant context,
 * build a prompt with context, and return a streaming AI response.
 */
export async function processQuery(
  message: string,
  userId: string,
  supabase: SupabaseClient,
  apiKey: string,
): Promise<ReadableStream> {
  const queryEmbedding = await generateEmbedding(message, apiKey);

  let contextResults: SimilarityResult[] = [];
  try {
    contextResults = await searchSimilar(queryEmbedding, userId, supabase, 5);
  } catch {
    contextResults = [];
  }

  const contextItems: ContextItem[] = contextResults.map((result) => ({
    type: result.sourceType,
    content: result.content,
    similarity: result.similarity,
  }));

  const systemPrompt = buildContextPrompt(contextItems, message);

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: systemPrompt,
    prompt: message,
    temperature: 0.7,
  });

  return result.textStream;
}
