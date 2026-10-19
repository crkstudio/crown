"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";

export type WithdrawalState = {
  ok?: boolean;
  /** Código de identificación de la solicitud (Disp. 954/2025). */
  code?: string;
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
  /** Lo que escribió el cliente: React 19 vacía el formulario después de cada acción. */
  values?: Partial<Record<string, string>>;
};

const FIELDS = ["name", "email", "phone", "orderNumber", "detail"] as const;

const input = z.object({
  name: z.string().trim().min(3, "Completá tu nombre y apellido").max(120, "El nombre es demasiado largo"),
  email: z.string().trim().toLowerCase().pipe(z.email("Ingresá un email válido")),
  phone: z.string().trim().max(40, "El teléfono es demasiado largo").optional(),
  orderNumber: z.coerce.number({ error: "Ingresá el número de pedido" }).int("Ingresá solo el número de pedido").positive("Ingresá el número de pedido"),
  detail: z.string().trim().min(5, "Contanos qué querés devolver").max(1000, "El detalle es demasiado largo"),
});

/** Código corto y legible, sin caracteres ambiguos (0/O, 1/I). */
function newCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  return "ARR-" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export async function submitWithdrawal(_prev: WithdrawalState, formData: FormData): Promise<WithdrawalState> {
  const values: Record<string, string> = {};
  for (const key of FIELDS) {
    const v = formData.get(key);
    if (typeof v === "string") values[key] = v;
  }

  const parsed = input.safeParse({ ...values, phone: values.phone || undefined });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { values, fieldErrors };
  }
  const d = parsed.data;

  // El pedido tiene que existir y el email tiene que ser el de la compra: así nadie puede iniciar
  // la devolución de un pedido ajeno solo adivinando el número.
  const [order] = await db
    .select({ id: schema.orders.id, status: schema.orders.status, email: schema.customers.email })
    .from(schema.orders)
    .leftJoin(schema.customers, eq(schema.customers.id, schema.orders.customerId))
    .where(eq(schema.orders.number, d.orderNumber))
    .limit(1);

  if (!order || order.email?.toLowerCase() !== d.email || order.status === "pending" || order.status === "cancelled") {
    return {
      values,
      error: "No encontramos un pedido pagado con ese número y ese email. Revisá los datos o escribinos y lo resolvemos.",
    };
  }

  // Si ya hay una solicitud abierta para este pedido, devolvemos la misma (evita duplicados por doble clic).
  const [existing] = await db
    .select({ code: schema.withdrawals.code })
    .from(schema.withdrawals)
    .where(and(eq(schema.withdrawals.orderId, order.id), eq(schema.withdrawals.status, "received")))
    .limit(1);
  if (existing) return { ok: true, code: existing.code, values };

  let code = newCode();
  for (let attempt = 0; ; attempt++) {
    try {
      await db.insert(schema.withdrawals).values({
        code,
        orderId: order.id,
        orderNumber: d.orderNumber,
        name: d.name,
        email: d.email,
        phone: d.phone ?? null,
        detail: d.detail,
      });
      break;
    } catch (e) {
      // Colisión de código (muy improbable): se reintenta con otro.
      if (attempt < 2 && e instanceof Error && /withdrawals_code_idx|duplicate/i.test(e.message)) {
        code = newCode();
        continue;
      }
      console.error("[arrepentimiento] no se pudo guardar", e);
      return { values, error: "No pudimos registrar tu solicitud. Probá de nuevo en un momento." };
    }
  }

  revalidatePath("/admin/arrepentimientos");
  return { ok: true, code, values };
}
