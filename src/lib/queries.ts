import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { and, asc, count, desc, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import type { Product, Variant } from "@/db/schema";

const { products, variants, settings, popups } = schema;

export type StoreProduct = Product & { variants: Variant[]; inStock: boolean };
export type SortKey = "nuevos" | "precio-asc" | "precio-desc";

function withVariants(rows: Product[], allVariants: Variant[]): StoreProduct[] {
  return rows.map((p) => {
    const vs = allVariants.filter((v) => v.productId === p.id);
    return { ...p, variants: vs, inStock: vs.some((v) => v.stock > 0) };
  });
}

/* Las lecturas públicas se cachean y se invalidan con updateTag("products")
   desde el panel admin cada vez que cambia el catálogo o el stock. */

export async function getStoreProducts(category?: string, sort: SortKey = "nuevos") {
  "use cache";
  cacheTag("products");
  cacheLife("minutes");

  const order =
    sort === "precio-asc" ? asc(products.price) : sort === "precio-desc" ? desc(products.price) : desc(products.createdAt);
  const rows = await db
    .select()
    .from(products)
    .where(category ? and(eq(products.listed, true), eq(products.category, category)) : eq(products.listed, true))
    .orderBy(order, desc(products.id));
  if (!rows.length) return [] as StoreProduct[];
  const vs = await db
    .select()
    .from(variants)
    .where(
      inArray(
        variants.productId,
        rows.map((r) => r.id),
      ),
    );
  return withVariants(rows, vs);
}

export async function getFeaturedProducts(limit = 4) {
  "use cache";
  cacheTag("products");
  cacheLife("minutes");

  let rows = await db
    .select()
    .from(products)
    .where(and(eq(products.listed, true), eq(products.featured, true)))
    .orderBy(desc(products.createdAt))
    .limit(limit);
  if (rows.length < limit) {
    // Si hay pocos destacados, completamos con los más nuevos.
    const extra = await db.select().from(products).where(eq(products.listed, true)).orderBy(desc(products.createdAt)).limit(limit);
    const ids = new Set(rows.map((r) => r.id));
    rows = [...rows, ...extra.filter((r) => !ids.has(r.id))].slice(0, limit);
  }
  if (!rows.length) return [] as StoreProduct[];
  const vs = await db
    .select()
    .from(variants)
    .where(
      inArray(
        variants.productId,
        rows.map((r) => r.id),
      ),
    );
  return withVariants(rows, vs);
}

export async function getProductBySlug(slug: string) {
  "use cache";
  cacheTag("products");
  cacheLife("minutes");

  const [p] = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.listed, true)))
    .limit(1);
  if (!p) return null;
  const vs = await db.select().from(variants).where(eq(variants.productId, p.id)).orderBy(asc(variants.id));
  return withVariants([p], vs)[0];
}

export async function getCategories() {
  "use cache";
  cacheTag("products");
  cacheLife("minutes");

  return db
    .select({ name: products.category, total: count() })
    .from(products)
    .where(eq(products.listed, true))
    .groupBy(products.category)
    .orderBy(asc(products.category));
}

/* ───────────── Ajustes ───────────── */

export type StoreSettings = {
  storeOpen: boolean;
  shippingFlat: number;
  freeShippingFrom: number;
  lowStockThreshold: number;
};

export async function getStoreSettings(): Promise<StoreSettings> {
  "use cache";
  cacheTag("settings");
  cacheLife("minutes");
  return readSettings();
}

/** Lectura directa (sin caché) para acciones del servidor y el panel. */
export async function readSettings(): Promise<StoreSettings> {
  const rows = await db.select().from(settings);
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const num = (key: string, fallback: number) => {
    const n = Number(map.get(key));
    return Number.isFinite(n) ? n : fallback;
  };
  return {
    storeOpen: map.get("store_open") === "true",
    shippingFlat: num("shipping_flat", 6500),
    freeShippingFrom: num("free_shipping_from", 120000),
    lowStockThreshold: num("low_stock_threshold", 5),
  };
}

/* ───────────── Pop-ups ───────────── */

export async function getActivePopups() {
  "use cache";
  cacheTag("popups");
  cacheLife("minutes");

  const rows = await db.select().from(popups).where(eq(popups.active, true)).orderBy(desc(popups.id));
  // La ventana de fechas se evalúa en el navegador (no se puede leer la hora acá dentro de la caché).
  return rows.map((p) => ({
    id: p.id,
    title: p.title,
    body: p.body,
    ctaLabel: p.ctaLabel,
    ctaUrl: p.ctaUrl,
    collectEmail: p.collectEmail,
    discountCode: p.discountCode,
    audience: p.audience,
    trigger: p.trigger,
    delaySeconds: p.delaySeconds,
    startsAt: p.startsAt ? p.startsAt.getTime() : null,
    endsAt: p.endsAt ? p.endsAt.getTime() : null,
  }));
}

export type PublicPopup = Awaited<ReturnType<typeof getActivePopups>>[number];
