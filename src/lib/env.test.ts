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
    delete process.env.ANTHROPIC_API_KEY;

    expect(() => getServerEnv()).toThrow("Missing or invalid environment variables");
  });

  it("returns validated env when all vars are present", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
    process.env.ANTHROPIC_API_KEY = "sk-ant-test-key";

    const env = getServerEnv();
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe("https://test.supabase.co");
    expect(env.ANTHROPIC_API_KEY).toBe("sk-ant-test-key");
  });

  it("rejects invalid URL for NEXT_PUBLIC_SUPABASE_URL", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "not-a-url";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
    process.env.ANTHROPIC_API_KEY = "sk-ant-test-key";

    expect(() => getServerEnv()).toThrow("Missing or invalid environment variables");
  });
});
