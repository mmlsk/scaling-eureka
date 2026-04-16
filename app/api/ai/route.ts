import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { processQuery } from '@/lib/ai/assistant';
import type { AIAssistantRequest, AIAssistantResponse } from '@/types/api';

interface AIErrorResponse {
  error: string;
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<AIAssistantResponse | AIErrorResponse>> {
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY not configured' },
      { status: 500 },
    );
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: 'Supabase credentials not configured' },
      { status: 500 },
    );
  }

  // Parse request body
  let body: AIAssistantRequest;
  try {
    body = await request.json() as AIAssistantRequest;
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const { message } = body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return NextResponse.json(
      { error: 'Message is required and must be a non-empty string' },
      { status: 400 },
    );
  }

  // Get user ID from auth header or Supabase auth
  const authHeader = request.headers.get('authorization');
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let userId: string | null = null;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const userClient = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY ?? supabaseServiceKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: authError } = await userClient.auth.getUser();

    if (authError || !userData.user) {
      return NextResponse.json(
        { error: 'Unauthorized: invalid auth token' },
        { status: 401 },
      );
    }
    userId = userData.user.id;
  }

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized: no valid authentication provided' },
      { status: 401 },
    );
  }

  try {
    const result = await processQuery(message, userId, supabase, openaiKey);

    return NextResponse.json(result);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `AI processing failed: ${errorMessage}` },
      { status: 500 },
    );
  }
}
