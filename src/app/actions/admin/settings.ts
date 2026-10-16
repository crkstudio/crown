"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";

export type SettingsState = { error?: string; ok?: boolean };

const settingsSchema = z.object({
  storeOpen: z.boolean(),
  shippingFlat: z.number().int().min(0).max(1_000_000),
  freeShippingFrom: z.number().int().min(0).max(100_000_000),
  lowStockThreshold: z.number().int().min(0).max(1000),
});

export async function saveSettings(_prev: SettingsState, fd: FormData): Promise<SettingsState> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse({
    storeOpen: fd.get("storeOpen") === "on",
    shippingFlat: Number(fd.get("shippingFlat")),
    freeShippingFrom: Number(fd.get("freeShippingFrom")),
    lowStockThreshold: Number(fd.get("lowStockThreshold")),
  });
  if (!parsed.success) return { error: "Revisá los números: tienen que ser enteros y no negativos." };
  const d = parsed.data;

  const rows: [string, string][] = [
    ["store_open", String(d.storeOpen)],
    ["shipping_flat", String(d.shippingFlat)],
    ["free_shipping_from", String(d.freeShippingFrom)],
    ["low_stock_threshold", String(d.lowStockThreshold)],
  ];
  for (const [key, value] of rows) {
    db.insert(schema.settings).values({ key, value }).onConflictDoUpdate({ target: schema.settings.key, set: { value } }).run();
  }
  updateTag("settings");
  revalidatePath("/admin", "layout");
  return { ok: true };
}
