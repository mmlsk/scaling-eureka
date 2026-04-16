// Browser-side Supabase client for Next.js App Router
// Uses @supabase/ssr createBrowserClient — safe to import in Client Components.

import { createBrowserClient } from '@supabase/ssr';

/**
 * Create a Supabase client for use in the browser (Client Components).
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from
 * the environment. These must be set in `.env.local` or the hosting
 * platform's env config.
 *
 * Usage:
 * ```ts
 * import { createClient } from '@/lib/supabase/client';
 * const supabase = createClient();
 * ```
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
