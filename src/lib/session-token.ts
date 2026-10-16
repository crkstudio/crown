import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "crown_admin";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

export type SessionPayload = { adminId: number; email: string; name: string };

function key() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET falta o es muy corto (mínimo 32 caracteres). Generá uno con: openssl rand -hex 32");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(key());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    if (typeof payload.adminId !== "number" || typeof payload.email !== "string") return null;
    return { adminId: payload.adminId, email: payload.email, name: String(payload.name ?? "") };
  } catch {
    return null;
  }
}
