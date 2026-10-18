import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession, type SessionPayload } from "./session-token";

export async function createSession(admin: { id: number; email: string; name: string }) {
  const token = await signSession({ adminId: admin.id, email: admin.email, name: admin.name });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Lee y valida la sesión. Devuelve null si no hay sesión o el admin ya no existe. */
export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  if (!session) return null;
  // Si borraron al admin de la base, la sesión deja de valer aunque el token no haya vencido.
  const [admin] = await db.select({ id: schema.admins.id }).from(schema.admins).where(eq(schema.admins.id, session.adminId)).limit(1);
  return admin ? session : null;
}

/**
 * Puerta de entrada de TODO acceso a datos del panel (páginas, acciones y rutas API).
 * El proxy es solo una primera barrera: la verificación real ocurre acá, cerca de los datos.
 */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}
