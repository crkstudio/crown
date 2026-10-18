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
    // El pooler de Supabase en modo transacción no admite prepared statements.
    prepare: false,
    max: process.env.NODE_ENV === "production" ? 1 : 10,
    // Vercel congela las funciones entre requests: conexiones que viven poco para no reutilizar una muerta.
    idle_timeout: 5,
    max_lifetime: 60,
    connect_timeout: 10,
    ssl: "require",
  });

if (process.env.NODE_ENV !== "production") globalForDb.__crownSql = client;

export const db = drizzle(client, { schema });
export { schema };
