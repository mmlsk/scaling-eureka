// Browser-side Supabase client for Next.js App Router
// Uses @supabase/ssr createBrowserClient — safe to import in Client Components.

import { createBrowserClient } from '@supabase/ssr';
import { getEnv } from '@/lib/env';

export function createClient() {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = getEnv();
  return createBrowserClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
