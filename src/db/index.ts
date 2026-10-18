import "server-only";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("Falta DATABASE_URL. Copiá la cadena de conexión de Supabase (Connect → Transaction pooler) en .env.local.");
}

// Una sola conexión compartida por instancia (también en producción: Vercel reutiliza la instancia entre requests).
const globalForDb = globalThis as unknown as { __crownSql?: ReturnType<typeof postgres> };

const client =
  globalForDb.__crownSql ??
  postgres(url, {
    // El pooler de Supabase en modo transacción no admite prepared statements.
    prepare: false,
    // Una instancia atiende varios requests a la vez: con 1 sola conexión las consultas hacían cola.
    // El pooler multiplexa, así que 5 es seguro.
    max: 5,
    idle_timeout: 10,
    max_lifetime: 300,
    connect_timeout: 10,
    ssl: "require",
  });

globalForDb.__crownSql = client;

export const db = drizzle(client, { schema });
export { schema };