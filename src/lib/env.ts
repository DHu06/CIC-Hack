import { z } from "zod";

/**
 * Server-side environment variables schema.
 * Validated at runtime — the app crashes at startup with a clear message
 * if any required variable is missing.
 */
const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
  ANTHROPIC_API_KEY: z.string().min(1, "ANTHROPIC_API_KEY is required"),
});

/**
 * Client-side environment variables schema.
 * Only NEXT_PUBLIC_ variables are available in the browser.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * Validates server-side environment variables.
 * Call this in server-side code (Server Components, Server Actions, Route Handlers).
 * Throws immediately with a clear error listing missing variables.
 */
export function getServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const message = Object.entries(errors)
      .map(([key, msgs]) => `  ${key}: ${msgs?.join(", ")}`)
      .join("\n");
    throw new Error(
      `\n\nMissing or invalid environment variables:\n${message}\n\nPlease check your .env.local file.\n`
    );
  }
  return parsed.data;
}

/**
 * Validates client-side (public) environment variables.
 * Call this in client-side code when needed.
 */
export function getClientEnv(): ClientEnv {
  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  if (!parsed.success) {
    throw new Error("Missing required public environment variables. Check your .env.local file.");
  }
  return parsed.data;
}
