import { createServerClient as _createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getServerEnv } from "@/lib/env";

/**
 * Creates a Supabase client for use in Server Components, Server Actions,
 * and Route Handlers. Uses the anon key with cookie-based auth.
 *
 * Always call this per-request — never cache or share across requests.
 */
export async function createServerClient() {
  const env = getServerEnv();
  const cookieStore = await cookies();

  return _createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet, _headers) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
}

/**
 * Creates a Supabase client with the service role key for admin operations.
 * Use ONLY in server-side code: seed scripts, AI pipeline writes, admin tasks.
 *
 * This client bypasses RLS — never expose it to client-side code.
 */
export function createServiceRoleClient() {
  const env = getServerEnv();

  return _createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        // Service role client doesn't need to manage cookies
      },
    },
  });
}
