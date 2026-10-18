import "server-only";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("Falta DATABASE_URL. Copiá la cadena de conexión de Supabase (Connect → Transaction pooler) en .env.local.");
}

// Reutilizamos la conexión entre recargas en desarrollo.
const globalForDb = globalThis as unknown as { __crownSql?: ReturnType<typeof postgres> };

const client =
  globalForDb.__crownSql ??
  postgres(url, {
  prepare: false,
  max: process.env.NODE_ENV === "production" ? 1 : 10,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: "require",
});

if (process.env.NODE_ENV !== "production") globalForDb.__crownSql = client;

export const db = drizzle(client, { schema });
export { schema };
