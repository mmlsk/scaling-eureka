import type { SupabaseClient } from '@supabase/supabase-js';
import type { AIAssistantResponse } from '@/types/api';
import type { SimilarityResult } from './embeddings';
import { generateEmbedding, searchSimilar } from './embeddings';

// ── OpenAI Chat Response Shape ──
interface OpenAIChatResponse {
  id: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

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
 * build a prompt with context, and return the AI response.
 */
export async function processQuery(
  message: string,
  userId: string,
  supabase: SupabaseClient,
  apiKey: string,
): Promise<AIAssistantResponse> {
  // Step 1: Generate embedding for the user's query
  const queryEmbedding = await generateEmbedding(message, apiKey);

  // Step 2: Search for similar content in the user's data
  let contextResults: SimilarityResult[] = [];
  try {
    contextResults = await searchSimilar(queryEmbedding, userId, supabase, 5);
  } catch {
    // If similarity search fails, continue without context
    contextResults = [];
  }

  // Step 3: Build the context items
  const contextItems: ContextItem[] = contextResults.map((result) => ({
    type: result.sourceType,
    content: result.content,
    similarity: result.similarity,
  }));

  // Step 4: Build the system prompt with context
  const systemPrompt = buildContextPrompt(contextItems, message);

  // Step 5: Call OpenAI Chat Completions API
  const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!chatRes.ok) {
    const errorBody = await chatRes.text();
    throw new Error(`OpenAI chat API failed: ${chatRes.status} ${errorBody}`);
  }

  const chatData: OpenAIChatResponse = await chatRes.json();

  const responseText = chatData.choices?.[0]?.message?.content;
  if (!responseText) {
    throw new Error('OpenAI returned no response content');
  }

  // Step 6: Build sources from context
  const sources = contextItems
    .filter((item) => item.similarity > 0.7)
    .map((item) => ({
      type: item.type,
      content: item.content.slice(0, 200),
    }));

  const result: AIAssistantResponse = {
    response: responseText,
  };

  if (sources.length > 0) {
    result.sources = sources;
  }

  return result;
}
