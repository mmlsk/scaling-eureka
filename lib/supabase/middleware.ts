// Supabase auth middleware for Next.js App Router
// Refreshes the auth session on every request so tokens stay valid.

import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Refresh the Supabase auth session via middleware.
 *
 * Call this from your root `middleware.ts`:
 *
 * ```ts
 * import { type NextRequest } from 'next/server';
 * import { updateSession } from '@/lib/supabase/middleware';
 *
 * export async function middleware(request: NextRequest) {
 *   return await updateSession(request);
 * }
 *
 * export const config = {
 *   matcher: [
 *     '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
 *   ],
 * };
 * ```
 */
export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // If Supabase is not configured, pass through without auth handling.
    return NextResponse.next({ request });
  }

  // Start with an unmodified response — we will layer cookie mutations on top.
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Mirror cookie changes onto the *request* so downstream Server
        // Components can read the updated values immediately.
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }

        // Recreate the response so the Set-Cookie headers propagate to
        // the browser.
        supabaseResponse = NextResponse.next({ request });

        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options);
        }
      },
    },
  });

  // IMPORTANT: Do NOT call supabase.auth.signInWith*, signUp, or
  // signOut here. Only getUser() is safe in middleware because it
  // reads/refreshes tokens without side-effects beyond cookie updates.
  // Avoid supabase.auth.getSession() — it reads from storage without
  // guaranteeing the token is still valid.
  await supabase.auth.getUser();

  return supabaseResponse;
}
