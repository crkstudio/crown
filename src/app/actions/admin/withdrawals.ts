"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { WITHDRAWAL_STATUSES } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export async function updateWithdrawalStatus(id: number, status: string): Promise<{ error?: string; ok?: boolean }> {
  await requireAdmin();
  const parsed = z.enum(WITHDRAWAL_STATUSES).safeParse(status);
  if (!parsed.success || !Number.isInteger(id)) return { error: "Estado no válido." };
  await db.update(schema.withdrawals).set({ status: parsed.data }).where(eq(schema.withdrawals.id, id));
  revalidatePath("/admin/arrepentimientos");
  return { ok: true };
}
