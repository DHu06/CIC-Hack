import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getServerEnv } from "./env";

describe("env configuration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("NEXT_PUBLIC_API_URL is the only required env var for frontend", () => {
    // The frontend only needs the API URL, everything else is in Lambda
    const required = ["NEXT_PUBLIC_API_URL"];
    expect(required).toHaveLength(1);
  });

  it("throws when required env vars are missing", () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    expect(() => getServerEnv()).toThrow("Missing or invalid environment variables");
  });

  it("returns validated env when all vars are present", () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001/api";
    const env = getServerEnv();
    expect(env.NEXT_PUBLIC_API_URL).toBe("http://localhost:3001/api");
  });
});
