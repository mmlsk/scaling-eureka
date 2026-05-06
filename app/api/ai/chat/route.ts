// app/api/ai/chat/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createClient } from '@/lib/supabase/server';
import { generateEmbedding, searchSimilar } from '@/lib/ai/embeddings';
import { buildContextPrompt } from '@/lib/ai/assistant';

export const runtime = 'edge';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { messages } = await request.json();
  const latestMessage = messages[messages.length - 1]?.content || '';

  const apiKey = process.env.OPENAI_API_KEY!;
  const queryEmbedding = await generateEmbedding(latestMessage, apiKey);
  const contextResults = await searchSimilar(queryEmbedding, user.id, supabase, 5);

  const contextItems = contextResults.map(r => ({
    type: r.sourceType,
    content: r.content,
    similarity: r.similarity,
  }));

  const systemPrompt = buildContextPrompt(contextItems, latestMessage);

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: systemPrompt,
    messages,
    temperature: 0.7,
  });

  return result.toDataStreamResponse();
}
