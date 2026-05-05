// Browser-side Supabase client for Next.js App Router
// Uses @supabase/ssr createBrowserClient — safe to import in Client Components.

import { createBrowserClient } from '@supabase/ssr';
import { getEnv } from '@/lib/env';

export function createClient() {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = getEnv();

  // During build/prerender, env vars may be empty - return a mock client
  if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (typeof window === 'undefined') {
      // Build/prerender time - return a minimal mock
      return null as unknown as ReturnType<typeof createBrowserClient>;
    }
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }
  return createBrowserClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
