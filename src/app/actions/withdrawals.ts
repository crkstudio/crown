"use server";

import { randomInt } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";

const { withdrawals, orders } = schema;

export type WithdrawalState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
  values?: Partial<Record<string, string>>;
  /** Constancia que se muestra al consumidor apenas se registra la solicitud. */
  done?: { code: string; at: string };
};

/* Límite simple en memoria: 5 solicitudes por hora por IP (evita spam; no frena a un consumidor real). */
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, { count: number; first: number }>();

function limited(ip: string) {
  const now = Date.now();
  const e = hits.get(ip);
  if (!e || now - e.first > WINDOW_MS) {
    hits.set(ip, { count: 1, first: now });
    return false;
  }
  e.count += 1;
  return e.count > MAX_PER_WINDOW;
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const dayFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });

function makeCode() {
  let s = "";
  for (let i = 0; i < 6; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return `ARR-${dayFmt.format(new Date()).replaceAll("-", "")}-${s}`;
}

const formSchema = z.object({
  name: z.string().trim().min(3, "Completá tu nombre y apellido").max(120),
  email: z.string().trim().toLowerCase().pipe(z.email("Ingresá un email válido")),
  phone: z.string().trim().max(40).transform((v) => v || null),
  orderNumber: z
    .string()
    .trim()
    .max(12)
    .regex(/^#?\d*$/, "Ingresá solo el número del pedido")
    .transform((v) => (v ? Number(v.replace("#", "")) : null)),
  detail: z.string().trim().max(500).transform((v) => v || null),
});

/**
 * Botón de arrepentimiento (Disp. 954/2025). Sin registro previo ni trámites adicionales:
 * se guarda la solicitud y se devuelve en el acto el código de identificación.
 * La gestión (retiro, reintegro) la hace el equipo desde Admin → Arrepentimientos.
 */
export async function requestWithdrawal(_prev: WithdrawalState, fd: FormData): Promise<WithdrawalState> {
  const values: Record<string, string> = {};
  for (const k of ["name", "email", "phone", "orderNumber", "detail"]) {
    const v = fd.get(k);
    if (typeof v === "string") values[k] = v;
  }

  // Campo trampa para bots: un humano no lo ve ni lo completa.
  if (String(fd.get("website") ?? "").length > 0) return { values, error: "No pudimos registrar la solicitud." };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (limited(ip)) return { values, error: "Hiciste muchas solicitudes seguidas. Probá de nuevo en un rato o escribinos por email." };

  const parsed = formSchema.safeParse({
    name: fd.get("name"),
    email: fd.get("email"),
    phone: String(fd.get("phone") ?? ""),
    orderNumber: String(fd.get("orderNumber") ?? ""),
    detail: String(fd.get("detail") ?? ""),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0] ?? "form")] ??= i.message;
    return { values, fieldErrors, error: "Revisá los campos marcados." };
  }
  const d = parsed.data;

  let orderId: number | null = null;
  if (d.orderNumber) {
    const [o] = await db.select({ id: orders.id }).from(orders).where(eq(orders.number, d.orderNumber)).limit(1);
    orderId = o?.id ?? null; // si no lo encontramos igual se registra: el equipo lo vincula a mano.
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const code = makeCode();
    try {
      await db.insert(withdrawals).values({
        code,
        name: d.name,
        email: d.email,
        phone: d.phone,
        orderNumber: d.orderNumber,
        orderId,
        detail: d.detail,
      });
      revalidatePath("/admin/arrepentimientos");
      return { done: { code, at: new Date().toISOString() } };
    } catch (e) {
      if (attempt === 2) {
        console.error("[arrepentimiento]", e);
        return { values, error: `No pudimos registrar tu solicitud. Escribinos a la casilla de atención y la gestionamos igual.` };
      }
    }
  }
  return { values, error: "No pudimos registrar tu solicitud." };
}
