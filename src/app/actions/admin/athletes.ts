"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { asc, eq, max } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";

const { athletes } = schema;

export type AthleteFormState = { error?: string; fieldErrors?: Record<string, string> };

// Fotos subidas al bucket de Supabase, o las que ya estaban en /public/athletes.
const SUPABASE_IMG = /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/products\/[a-f0-9-]{36}\.webp$/;
const LOCAL_IMG = /^\/athletes\/[\w.-]+$/;

const athleteSchema = z.object({
  name: z.string().trim().min(2, "Poné un nombre").max(80),
  sport: z.string().trim().min(2, "Poné una etiqueta (deporte o “Atleta crown”)").max(80),
  image: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || SUPABASE_IMG.test(v) || LOCAL_IMG.test(v), "Imagen no válida")
    .transform((v) => v || null),
  visible: z.boolean(),
});

function parse(fd: FormData) {
  const parsed = athleteSchema.safeParse({
    name: fd.get("name"),
    sport: fd.get("sport"),
    image: String(fd.get("image") ?? ""),
    visible: fd.get("visible") === "on",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0] ?? "form")] ??= i.message;
    return { ok: false as const, state: { fieldErrors, error: "Revisá los campos marcados." } satisfies AthleteFormState };
  }
  return { ok: true as const, data: parsed.data };
}

function refresh() {
  updateTag("athletes");
  revalidatePath("/admin/athletes");
}

export async function createAthlete(_prev: AthleteFormState, fd: FormData): Promise<AthleteFormState> {
  await requireAdmin();
  const v = parse(fd);
  if (!v.ok) return v.state;
  const [{ last }] = await db.select({ last: max(athletes.position) }).from(athletes);
  await db.insert(athletes).values({ ...v.data, position: (last ?? -1) + 1 });
  refresh();
  redirect("/admin/athletes?ok=creado");
}

export async function updateAthlete(id: number, _prev: AthleteFormState, fd: FormData): Promise<AthleteFormState> {
  await requireAdmin();
  const v = parse(fd);
  if (!v.ok) return v.state;
  await db.update(athletes).set(v.data).where(eq(athletes.id, id));
  refresh();
  redirect("/admin/athletes?ok=guardado");
}

export async function setAthleteVisible(id: number, visible: boolean) {
  await requireAdmin();
  await db.update(athletes).set({ visible }).where(eq(athletes.id, id));
  refresh();
}

/** Sube o baja un lugar. Reescribe las posiciones 0..n para que nunca queden repetidas. */
export async function moveAthlete(id: number, dir: -1 | 1) {
  await requireAdmin();
  await db.transaction(async (tx) => {
    const rows = await tx.select({ id: athletes.id }).from(athletes).orderBy(asc(athletes.position), asc(athletes.id));
    const i = rows.findIndex((r) => r.id === id);
    const j = i + dir;
    if (i === -1 || j < 0 || j >= rows.length) return;
    [rows[i], rows[j]] = [rows[j], rows[i]];
    for (let k = 0; k < rows.length; k++) {
      await tx.update(athletes).set({ position: k }).where(eq(athletes.id, rows[k].id));
    }
  });
  refresh();
}

export async function deleteAthlete(id: number) {
  await requireAdmin();
  await db.delete(athletes).where(eq(athletes.id, id));
  refresh();
  redirect("/admin/athletes?ok=eliminado");
}