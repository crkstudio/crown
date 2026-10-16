import "server-only";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "node:path";
import * as schema from "./schema";

const file = process.env.DATABASE_URL ?? path.join(process.cwd(), "data", "crown.db");

// Reutilizamos la conexión entre recargas en desarrollo.
const globalForDb = globalThis as unknown as { __crownSqlite?: Database.Database };

const sqlite =
  globalForDb.__crownSqlite ??
  (() => {
    const conn = new Database(file);
    conn.pragma("journal_mode = WAL");
    conn.pragma("foreign_keys = ON");
    return conn;
  })();

if (process.env.NODE_ENV !== "production") globalForDb.__crownSqlite = sqlite;

export const db = drizzle(sqlite, { schema });
export { schema };
