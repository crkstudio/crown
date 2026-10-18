"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { HOME_SECTION_IDS, HOME_SECTIONS_KEY, normalizeHomeSections } from "@/lib/home-sections";

export type HomeSectionsState = { error?: string; ok?: boolean };

const payloadSchema = z.array(z.object({ id: z.enum(HOME_SECTION_IDS), enabled: z.boolean() })).max(HOME_SECTION_IDS.length);

export async function saveHomeSections(_prev: HomeSectionsState, fd: FormData): Promise<HomeSectionsState> {
  await requireAdmin();

  let json: unknown;
  try {
    json = JSON.parse(String(fd.get("sections") ?? ""));
  } catch {
    return { error: "No pudimos leer el orden de las secciones. Recargá la página e intentá de nuevo." };
  }
  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) return { error: "La lista de secciones no es válida. Recargá la página e intentá de nuevo." };

  const sections = normalizeHomeSections(parsed.data);
  if (!sections.some((s) => s.enabled)) return { error: "Dejá al menos una sección prendida: si no, la página de inicio quedaría vacía." };

  const value = JSON.stringify(sections);
  await db
    .insert(schema.settings)
    .values({ key: HOME_SECTIONS_KEY, value })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value } });

  updateTag("settings");
  revalidatePath("/");
  revalidatePath("/admin/inicio");
  return { ok: true };
}
