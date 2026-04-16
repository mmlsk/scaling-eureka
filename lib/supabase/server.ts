// Server-side Supabase client for Next.js App Router
// Uses @supabase/ssr createServerClient with Next.js cookies()

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Create a Supabase client for use on the server (Server Components,
 * Route Handlers, Server Actions).
 *
 * Wires cookie get/set/remove through the Next.js `cookies()` API so that
 * Supabase auth tokens are automatically stored/refreshed in HTTP-only cookies.
 *
 * Usage:
 * ```ts
 * import { createClient } from '@/lib/supabase/server';
 * const supabase = await createClient();
 * const { data } = await supabase.from('table').select();
 * ```
 */
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // `setAll` is called from a Server Component where cookies cannot
          // be mutated. This is expected when refreshing tokens during SSR
          // — the middleware will handle the refresh on the next request.
        }
      },
    },
  });
}
