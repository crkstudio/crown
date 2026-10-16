"use server";

import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";

const { popups, customers } = schema;

const idSchema = z.number().int().positive();
const emailSchema = z.string().trim().toLowerCase().pipe(z.email());

export async function trackPopupView(popupId: number) {
  const id = idSchema.safeParse(popupId);
  if (!id.success) return;
  await db.update(popups).set({ views: sql`${popups.views} + 1` }).where(eq(popups.id, id.data));
}

export async function trackPopupClick(popupId: number) {
  const id = idSchema.safeParse(popupId);
  if (!id.success) return;
  await db.update(popups).set({ conversions: sql`${popups.conversions} + 1` }).where(eq(popups.id, id.data));
}

/** Guarda el email del visitante como cliente (con permiso de marketing) y devuelve el código de descuento. */
export async function subscribeFromPopup(
  popupId: number,
  rawEmail: string,
): Promise<{ ok: true; code: string | null } | { ok: false; error: string }> {
  const id = idSchema.safeParse(popupId);
  const email = emailSchema.safeParse(rawEmail);
  if (!id.success) return { ok: false, error: "Este pop-up ya no está disponible." };
  if (!email.success) return { ok: false, error: "Revisá el email, parece incompleto." };

  const [popup] = await db.select().from(popups).where(eq(popups.id, id.data)).limit(1);
  if (!popup || !popup.active) return { ok: false, error: "Este pop-up ya no está disponible." };

  await db
    .insert(customers)
    .values({ email: email.data, source: "popup", marketingOptIn: true })
    .onConflictDoUpdate({ target: customers.email, set: { marketingOptIn: true } });
  await db.update(popups).set({ conversions: sql`${popups.conversions} + 1` }).where(eq(popups.id, popup.id));

  return { ok: true, code: popup.discountCode };
}
