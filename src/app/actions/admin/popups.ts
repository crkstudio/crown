"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { POPUP_AUDIENCES, POPUP_TRIGGERS } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export type PopupFormState = { error?: string; fieldErrors?: Record<string, string> };

const dateInput = z
  .string()
  .trim()
  .transform((v) => (v ? new Date(`${v}T00:00:00-03:00`) : null))
  .refine((d) => d === null || !Number.isNaN(d.getTime()), "Fecha no válida");

const popupSchema = z.object({
  name: z.string().trim().min(2, "Poné un nombre interno").max(80),
  title: z.string().trim().min(2, "Poné un título").max(80),
  body: z.string().trim().max(240, "Máximo 240 caracteres"),
  ctaLabel: z.string().trim().min(2, "Poné el texto del botón").max(40),
  ctaUrl: z
    .string()
    .trim()
    .max(300)
    .refine((v) => v === "" || v.startsWith("/") || /^https:\/\//i.test(v), "Usá una ruta (/tienda) o un link que empiece con https://")
    .transform((v) => v || null),
  collectEmail: z.boolean(),
  discountCode: z
    .string()
    .trim()
    .toUpperCase()
    .max(24)
    .regex(/^[A-Z0-9_-]*$/, "Solo letras, números, guiones")
    .transform((v) => v || null),
  audience: z.enum(POPUP_AUDIENCES),
  trigger: z.enum(POPUP_TRIGGERS),
  delaySeconds: z.number().int().min(0).max(300),
  active: z.boolean(),
  startsAt: dateInput,
  endsAt: dateInput,
});

function parse(fd: FormData) {
  const parsed = popupSchema.safeParse({
    name: fd.get("name"),
    title: fd.get("title"),
    body: String(fd.get("body") ?? ""),
    ctaLabel: fd.get("ctaLabel"),
    ctaUrl: String(fd.get("ctaUrl") ?? ""),
    collectEmail: fd.get("collectEmail") === "on",
    discountCode: String(fd.get("discountCode") ?? ""),
    audience: fd.get("audience"),
    trigger: fd.get("trigger"),
    delaySeconds: Number(fd.get("delaySeconds") ?? 4),
    active: fd.get("active") === "on",
    startsAt: String(fd.get("startsAt") ?? ""),
    endsAt: String(fd.get("endsAt") ?? ""),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0] ?? "form")] ??= i.message;
    return { ok: false as const, state: { fieldErrors, error: "Revisá los campos marcados." } satisfies PopupFormState };
  }
  const d = parsed.data;
  if (!d.collectEmail && !d.ctaUrl) {
    return { ok: false as const, state: { fieldErrors: { ctaUrl: "Si no pedís el email, el botón necesita un link" }, error: "Revisá los campos marcados." } };
  }
  if (d.startsAt && d.endsAt && d.endsAt < d.startsAt) {
    return { ok: false as const, state: { fieldErrors: { endsAt: "La fecha de fin es anterior al inicio" }, error: "Revisá los campos marcados." } };
  }
  return { ok: true as const, data: d };
}

function refresh() {
  updateTag("popups");
  revalidatePath("/admin/popups");
}

export async function createPopup(_prev: PopupFormState, fd: FormData): Promise<PopupFormState> {
  await requireAdmin();
  const v = parse(fd);
  if (!v.ok) return v.state;
  db.insert(schema.popups).values(v.data).run();
  refresh();
  redirect("/admin/popups?ok=creado");
}

export async function updatePopup(id: number, _prev: PopupFormState, fd: FormData): Promise<PopupFormState> {
  await requireAdmin();
  const v = parse(fd);
  if (!v.ok) return v.state;
  db.update(schema.popups).set(v.data).where(eq(schema.popups.id, id)).run();
  refresh();
  redirect("/admin/popups?ok=guardado");
}

export async function setPopupActive(id: number, active: boolean) {
  await requireAdmin();
  db.update(schema.popups).set({ active }).where(eq(schema.popups.id, id)).run();
  refresh();
}

export async function deletePopup(id: number) {
  await requireAdmin();
  db.delete(schema.popups).where(eq(schema.popups.id, id)).run();
  refresh();
  redirect("/admin/popups?ok=eliminado");
}
