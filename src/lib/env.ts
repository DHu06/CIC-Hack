import { z } from "zod";

/**
 * Server-side environment variables schema.
 * With the AWS migration, most secrets live in Lambda env vars.
 * The frontend only needs the API URL.
 */
const serverEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().min(1, "NEXT_PUBLIC_API_URL is required"),
});

/**
 * Client-side environment variables schema.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().min(1, "NEXT_PUBLIC_API_URL is required"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

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

export function getClientEnv(): ClientEnv {
  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  });
  if (!parsed.success) {
    throw new Error("Missing NEXT_PUBLIC_API_URL environment variable.");
  }
  return parsed.data;
}
