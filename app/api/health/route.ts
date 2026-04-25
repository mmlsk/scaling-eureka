import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  let supabaseOk = false;
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('habits').select('id').limit(1);
    supabaseOk = !error || error.code === 'PGRST116'; // PGRST116 = empty (RLS), still healthy
  } catch {
    supabaseOk = false;
  }

  return NextResponse.json({
    status: supabaseOk ? 'ok' : 'degraded',
    supabase: supabaseOk,
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'dev',
  });
}

export const dynamic = 'force-dynamic';
