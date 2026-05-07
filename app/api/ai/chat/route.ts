// app/api/ai/chat/route.ts
import { convertToModelMessages, streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createClient } from '@/lib/supabase/server';
import { generateEmbedding, searchSimilar } from '@/lib/ai/embeddings';
import { buildContextPrompt } from '@/lib/ai/assistant';

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export const runtime = 'edge';
export const maxDuration = 30;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { messages } = await request.json();

  // Get the latest user message for RAG embedding
  const userMessages = messages.filter((m: { role: string }) => m.role === 'user');
  const latestMessage = userMessages[userMessages.length - 1];
  const latestText = latestMessage?.parts
    ?.filter((p: { type: string }) => p.type === 'text')
    ?.map((p: { text: string }) => p.text)
    ?.join('') || '';

  const apiKey = process.env.OPENROUTER_API_KEY!;
  const queryEmbedding = await generateEmbedding(latestText, apiKey);
  const contextResults = await searchSimilar(queryEmbedding, user.id, supabase, 5);

  const contextItems = contextResults.map(r => ({
    type: r.sourceType,
    content: r.content,
    similarity: r.similarity,
  }));

  const systemPrompt = buildContextPrompt(contextItems, latestText);

  const result = streamText({
    model: openrouter('google/gemini-2.0-flash-001'),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    temperature: 0.7,
  });

  return result.toUIMessageStreamResponse();
}
