import { NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";

export async function GET() {
  const config = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? "postgres",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME ?? "postgres",
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  };

  const pool = new Pool(config);
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    return NextResponse.json({ ok: true, host: config.host, user: config.user });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const code = (err as Record<string, unknown>).code;
    return NextResponse.json(
      { ok: false, error: message, code, host: config.host, user: config.user },
      { status: 500 },
    );
  } finally {
    await pool.end();
  }
}
