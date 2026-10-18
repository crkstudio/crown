"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db, schema } from "@/db";
import { createSession, destroySession, requireAdmin } from "@/lib/auth";

export type LoginState = { error?: string; email?: string };

/* Límite de intentos en memoria: 5 fallos cada 15 minutos por email+IP.
   Alcanza para una instancia única; con varias instancias conviene moverlo a Redis. */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map<string, { count: number; first: number }>();

function tooMany(key: string) {
  const entry = attempts.get(key);
  if (!entry) return false;
  if (Date.now() - entry.first > WINDOW_MS) {
    attempts.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}
function recordFailure(key: string) {
  const entry = attempts.get(key);
  if (!entry || Date.now() - entry.first > WINDOW_MS) attempts.set(key, { count: 1, first: Date.now() });
  else entry.count += 1;
}

// Hash de relleno: así tardamos lo mismo exista o no el email (evita enumerar cuentas).
let dummyHash: string | undefined;
const getDummyHash = () => (dummyHash ??= bcrypt.hashSync("crown-dummy-password", 12));

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  // React 19 vacía el formulario después de cada acción: devolvemos el email para no obligar a reescribirlo.
  const typedEmail = String(formData.get("email") ?? "").slice(0, 200);
  const parsed = z
    .object({ email: z.string().trim().toLowerCase().pipe(z.email()), password: z.string().min(1).max(200) })
    .safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: "Revisá el email y la contraseña.", email: typedEmail };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const key = `${parsed.data.email}|${ip}`;
  if (tooMany(key)) return { error: "Demasiados intentos. Esperá 15 minutos y volvé a probar.", email: typedEmail };

  const [admin] = await db.select().from(schema.admins).where(eq(schema.admins.email, parsed.data.email)).limit(1);
  const ok = await bcrypt.compare(parsed.data.password, admin?.passwordHash ?? getDummyHash());
  if (!admin || !ok) {
    recordFailure(key);
    return { error: "Email o contraseña incorrectos.", email: typedEmail };
  }

  attempts.delete(key);
  await createSession(admin);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

export async function changePassword(
  _prev: { error?: string; ok?: boolean },
  formData: FormData,
): Promise<{ error?: string; ok?: boolean }> {
  const session = await requireAdmin();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  if (next.length < 10) return { error: "La nueva contraseña debe tener al menos 10 caracteres." };
  if (next === current) return { error: "La nueva contraseña tiene que ser distinta de la actual." };

  const [admin] = await db.select().from(schema.admins).where(eq(schema.admins.id, session.adminId)).limit(1);
  if (!admin || !(await bcrypt.compare(current, admin.passwordHash))) return { error: "La contraseña actual no es correcta." };

  await db.update(schema.admins).set({ passwordHash: await bcrypt.hash(next, 12) }).where(eq(schema.admins.id, admin.id));
  return { ok: true };
}
