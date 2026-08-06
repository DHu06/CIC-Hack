import pg from "pg";
import { Signer } from "@aws-sdk/rds-signer";

const { Pool } = pg;

let pool: pg.Pool | null = null;
let tokenExpiry: number = 0;

const DB_HOST = process.env.DB_HOST!;
const DB_PORT = parseInt(process.env.DB_PORT || "5432");
const DB_USER = process.env.DB_USER || "postgres";
const DB_NAME = process.env.DB_NAME || "studyhall";
const DB_REGION = process.env.AWS_REGION || "us-east-1";

async function getAuthToken(): Promise<string> {
  const signer = new Signer({
    hostname: DB_HOST,
    port: DB_PORT,
    username: DB_USER,
    region: DB_REGION,
  });
  return signer.getAuthToken();
}

export async function getPool(): Promise<pg.Pool> {
  const now = Date.now();
  // IAM tokens are valid for 15 min; refresh every 10 min
  if (!pool || now >= tokenExpiry) {
    if (pool) {
      await pool.end();
    }
    const token = await getAuthToken();
    pool = new Pool({
      host: DB_HOST,
      database: DB_NAME,
      user: DB_USER,
      password: token,
      port: DB_PORT,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: { rejectUnauthorized: false },
    });
    tokenExpiry = now + 10 * 60 * 1000;
  }
  return pool;
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const p = await getPool();
  const result = await p.query(text, params);
  return result.rows as T[];
}

export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] || null;
}
