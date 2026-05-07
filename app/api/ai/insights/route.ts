// app/api/ai/insights/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function GET(_request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const [
    { data: habits },
    { data: todos },
    { data: sleepLogs },
    { data: moodEntries },
  ] = await Promise.all([
    supabase.from('habits').select('*, habit_entries(*)').eq('user_id', user.id).returns(),
    supabase.from('todos').select('*').eq('user_id', user.id).eq('done', false).returns(),
    supabase.from('sleep_log').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(7),
    supabase.from('mood_entries').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(7),
  ]);

  const dataSummary = JSON.stringify({ habits, todos, sleepLogs, moodEntries }, null, 2);

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: `You are a personal AI assistant. Analyze the user's data and provide personalized insights, pattern recognition, and smart suggestions. Be concise and actionable.`,
    prompt: `Analyze this user data and provide insights:\n${dataSummary}`,
    temperature: 0.7,
  });

  return result.toTextStreamResponse();
}
