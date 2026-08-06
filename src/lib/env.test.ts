import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getServerEnv } from "./env";

describe("env validation", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("throws when required env vars are missing", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.GEMINI_API_KEY;

    expect(() => getServerEnv()).toThrow("Missing or invalid environment variables");
  });

  it("returns validated env when all vars are present", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
    process.env.GEMINI_API_KEY = "test-gemini-key";

    const env = getServerEnv();
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe("https://test.supabase.co");
    expect(env.GEMINI_API_KEY).toBe("test-gemini-key");
  });

  it("rejects invalid URL for NEXT_PUBLIC_SUPABASE_URL", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "not-a-url";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
    process.env.GEMINI_API_KEY = "test-gemini-key";

    expect(() => getServerEnv()).toThrow("Missing or invalid environment variables");
  });
});
