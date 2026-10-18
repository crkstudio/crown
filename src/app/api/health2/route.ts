import { NextResponse } from "next/server";
import { count } from "drizzle-orm";
import { db, schema } from "@/db";

export async function GET() {
  const t = Date.now();
  try {
    const result = await Promise.race([
      db.select({ n: count() }).from(schema.products),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("La consulta no respondió en 8 s")), 8000)),
    ]);
    return NextResponse.json({ ok: true, ms: Date.now() - t, products: result[0].n });
  } catch (e) {
    return NextResponse.json({ ok: false, ms: Date.now() - t, message: (e as Error).message }, { status: 500 });
  }
}