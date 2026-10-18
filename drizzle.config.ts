import { defineConfig } from "drizzle-kit";

try {
  process.loadEnvFile(".env.local");
} catch {
  /* sin .env.local: usamos variables del entorno */
}

// Para crear/modificar tablas conviene la conexión directa (DIRECT_URL, puerto 5432):
// el pooler en modo transacción no es apto para migraciones.
const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!url) throw new Error("Falta DIRECT_URL o DATABASE_URL en .env.local");

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
});
