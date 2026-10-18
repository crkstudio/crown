"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { and, eq, inArray, ne } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

const { products, variants } = schema;

export type ProductFormState = { error?: string; fieldErrors?: Record<string, string> };

const variantSchema = z.object({
  id: z.number().int().positive().optional(),
  size: z.string().trim().min(1, "Falta el talle").max(20),
  color: z.string().trim().min(1, "Falta el color").max(30),
  sku: z.string().trim().max(40).optional().transform((v) => v || null),
  stock: z.number().int("El stock debe ser un número entero").min(0, "El stock no puede ser negativo").max(100000),
});

const productSchema = z.object({
  name: z.string().trim().min(2, "Poné un nombre").max(120),
  category: z.string().trim().min(2, "Elegí o escribí una categoría").max(40),
  description: z.string().trim().max(3000),
  price: z.number().int("El precio debe ser un número entero").min(1, "El precio debe ser mayor a 0").max(100_000_000),
  compareAtPrice: z.number().int().min(1).max(100_000_000).nullable(),
  listed: z.boolean(),
  featured: z.boolean(),
  images: z
  .array(
    z
      .string()
      .regex(
        /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/products\/[a-f0-9-]{36}\.webp$/,
        "Imagen no válida",
      ),
  )
  .max(8),
  variants: z.array(variantSchema).min(1, "Agregá al menos una variante (talle y color)").max(80),
});

function readForm(fd: FormData) {
  const num = (k: string) => {
    const raw = String(fd.get(k) ?? "").trim();
    return raw === "" ? null : Number(raw);
  };
  let images: unknown = [];
  let vs: unknown = [];
  try {
    images = JSON.parse(String(fd.get("images") ?? "[]"));
    vs = JSON.parse(String(fd.get("variants") ?? "[]"));
  } catch {
    /* el esquema lo reporta */
  }
  return {
    name: fd.get("name"),
    category: fd.get("category"),
    description: String(fd.get("description") ?? ""),
    price: num("price"),
    compareAtPrice: num("compareAtPrice"),
    listed: fd.get("listed") === "on",
    featured: fd.get("featured") === "on",
    images,
    variants: vs,
  };
}

function validate(fd: FormData) {
  const parsed = productSchema.safeParse(readForm(fd));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0] ?? "form")] ??= i.message;
    return { ok: false as const, state: { fieldErrors, error: "Revisá los campos marcados." } satisfies ProductFormState };
  }
  const d = parsed.data;
  if (d.compareAtPrice !== null && d.compareAtPrice <= d.price) {
    return { ok: false as const, state: { fieldErrors: { compareAtPrice: "El precio anterior debe ser mayor al precio actual" }, error: "Revisá los campos marcados." } };
  }
  const seen = new Set<string>();
  for (const v of d.variants) {
    const k = `${v.size.toLowerCase()}|${v.color.toLowerCase()}`;
    if (seen.has(k)) return { ok: false as const, state: { fieldErrors: { variants: `La combinación ${v.size} / ${v.color} está repetida` }, error: "Revisá los campos marcados." } };
    seen.add(k);
  }
  return { ok: true as const, data: d };
}

async function uniqueSlug(base: string, excludeId?: number) {
  const root = slugify(base) || "producto";
  let slug = root;
  for (let n = 2; ; n++) {
    const [clash] = await db
      .select({ id: products.id })
      .from(products)
      .where(excludeId ? and(eq(products.slug, slug), ne(products.id, excludeId)) : eq(products.slug, slug))
      .limit(1);
    if (!clash) return slug;
    slug = `${root}-${n}`;
  }
}

function refreshStore() {
  updateTag("products");
  revalidatePath("/admin", "layout");
}

export async function createProduct(_prev: ProductFormState, fd: FormData): Promise<ProductFormState> {
  await requireAdmin();
  const v = validate(fd);
  if (!v.ok) return v.state;
  const d = v.data;

  const slug = await uniqueSlug(d.name);
  await db.transaction(async (tx) => {
    const [p] = await tx
      .insert(products)
      .values({
        slug,
        name: d.name,
        category: d.category,
        description: d.description,
        price: d.price,
        compareAtPrice: d.compareAtPrice,
        images: d.images,
        listed: d.listed,
        featured: d.featured,
      })
      .returning();
    if (d.variants.length) {
      await tx.insert(variants).values(d.variants.map((x) => ({ productId: p.id, size: x.size, color: x.color, sku: x.sku, stock: x.stock })));
    }
  });
  refreshStore();
  redirect("/admin/productos?ok=creado");
}

export async function updateProduct(id: number, _prev: ProductFormState, fd: FormData): Promise<ProductFormState> {
  await requireAdmin();
  const v = validate(fd);
  if (!v.ok) return v.state;
  const d = v.data;

  const [existing] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!existing) return { error: "Este producto ya no existe." };

  await db.transaction(async (tx) => {
    await tx
      .update(products)
      .set({
        name: d.name,
        category: d.category,
        description: d.description,
        price: d.price,
        compareAtPrice: d.compareAtPrice,
        images: d.images,
        listed: d.listed,
        featured: d.featured,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));

    // Sincronizar variantes: se actualizan las conocidas, se crean las nuevas y se borran las que sacaron del formulario.
    const current = await tx.select({ id: variants.id }).from(variants).where(eq(variants.productId, id));
    const currentIds = new Set(current.map((c) => c.id));
    const keepIds = new Set(d.variants.flatMap((x) => (x.id && currentIds.has(x.id) ? [x.id] : [])));
    const toDelete = [...currentIds].filter((cid) => !keepIds.has(cid));
    if (toDelete.length) await tx.delete(variants).where(inArray(variants.id, toDelete));

    for (const x of d.variants) {
      if (x.id && currentIds.has(x.id)) {
        await tx.update(variants).set({ size: x.size, color: x.color, sku: x.sku, stock: x.stock }).where(eq(variants.id, x.id));
      } else {
        await tx.insert(variants).values({ productId: id, size: x.size, color: x.color, sku: x.sku, stock: x.stock });
      }
    }
  });
  refreshStore();
  redirect("/admin/productos?ok=guardado");
}

export async function deleteProduct(id: number) {
  await requireAdmin();
  // Los pedidos viejos conservan nombre, talle y precio (están copiados en cada línea del pedido).
  await db.delete(products).where(eq(products.id, id));
  refreshStore();
  redirect("/admin/productos?ok=eliminado");
}

/** Listar u ocultar de la tienda, sin borrar nada. */
export async function setProductListed(id: number, listed: boolean) {
  await requireAdmin();
  await db.update(products).set({ listed, updatedAt: new Date() }).where(eq(products.id, id));
  refreshStore();
}

export async function setProductFeatured(id: number, featured: boolean) {
  await requireAdmin();
  await db.update(products).set({ featured, updatedAt: new Date() }).where(eq(products.id, id));
  refreshStore();
}

/** Ajusta el stock de una variante: delta (+/-) o valor exacto. Nunca queda negativo. */
export async function setVariantStock(variantId: number, stock: number) {
  await requireAdmin();
  const value = z.number().int().min(0).max(100000).safeParse(stock);
  if (!value.success) return { error: "El stock debe ser un número entero de 0 en adelante." };
  await db.update(variants).set({ stock: value.data }).where(eq(variants.id, variantId));
  refreshStore();
  return { ok: true as const };
}
