import { NextResponse } from "next/server";
import postgres from "postgres";

export async function GET() {
  const url = process.env.DATABASE_URL;
  if (!url) return NextResponse.json({ ok: false, error: "DATABASE_URL está vacía en runtime" }, { status: 500 });

  let info: Record<string, string> = {};
  try {
    const u = new URL(url);
    info = { host: u.hostname, port: u.port, user: u.username, db: u.pathname, region: process.env.VERCEL_REGION ?? "?" };
  } catch {
    return NextResponse.json({ ok: false, error: "DATABASE_URL no es una URL válida (¿caracteres sin codificar en la clave?)" }, { status: 500 });
  }

  const sql = postgres(url, { prepare: false, max: 1, connect_timeout: 8, ssl: "require" });
  try {
    const t = Date.now();
    await sql`select 1`;
    return NextResponse.json({ ok: true, ms: Date.now() - t, ...info });
  } catch (e) {
    const err = e as { code?: string; message?: string };
    return NextResponse.json({ ok: false, code: err.code, message: err.message, ...info }, { status: 500 });
  } finally {
    await sql.end({ timeout: 1 });
  }
}