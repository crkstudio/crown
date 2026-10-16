"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { ORDER_STATUSES } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { changeOrderStatus, OrderError } from "@/lib/orders";

export async function updateOrderStatus(orderId: number, status: string): Promise<{ error?: string; ok?: boolean }> {
  await requireAdmin();
  const parsed = z.enum(ORDER_STATUSES).safeParse(status);
  if (!parsed.success || !Number.isInteger(orderId)) return { error: "Estado no válido." };
  try {
    changeOrderStatus(orderId, parsed.data);
  } catch (e) {
    if (e instanceof OrderError) return { error: e.message };
    throw e;
  }
  updateTag("products"); // si se canceló, el stock volvió
  revalidatePath("/admin", "layout");
  return { ok: true };
}
