import { createBrowserClient as _createBrowserClient } from "@supabase/ssr";
import { getClientEnv } from "@/lib/env";

/**
 * Creates a Supabase client for use in Client Components.
 * Uses the anon key with cookie-based auth (handled automatically by @supabase/ssr).
 *
 * This is a singleton — safe to call multiple times in client components.
 */
export function createBrowserClient() {
  const env = getClientEnv();

  return _createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
