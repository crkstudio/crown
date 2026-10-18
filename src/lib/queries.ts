import "server-only";
import { unstable_cache } from "next/cache";
import { and, asc, count, desc, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import type { Product, Variant } from "@/db/schema";
import { HOME_SECTIONS_KEY, normalizeHomeSections, type HomeSectionConfig } from "@/lib/home-sections";

const { products, variants, settings, popups } = schema;

export type StoreProduct = Product & { variants: Variant[]; inStock: boolean };
export type SortKey = "nuevos" | "precio-asc" | "precio-desc";

/*
 * Las lecturas públicas se guardan en la caché de datos de Next (60 s) y se invalidan al instante
 * con updateTag("products" | "settings" | "popups") desde el panel admin.
 * Ojo: al pasar por la caché, las fechas (createdAt) llegan como texto. La tienda no las usa.
 */
const TTL = 60;

async function variantsFor(rows: Product[]): Promise<Variant[]> {
  if (!rows.length) return [];
  return db.select().from(variants).where(inArray(variants.productId, rows.map((r) => r.id)));
}

function withVariants(rows: Product[], allVariants: Variant[]): StoreProduct[] {
  return rows.map((p) => {
    const vs = allVariants.filter((v) => v.productId === p.id);
    return { ...p, variants: vs, inStock: vs.some((v) => v.stock > 0) };
  });
}

export const getStoreProducts = unstable_cache(
  async (category?: string, sort: SortKey = "nuevos", limit?: number): Promise<StoreProduct[]> => {
    const order =
      sort === "precio-asc" ? asc(products.price) : sort === "precio-desc" ? desc(products.price) : desc(products.createdAt);
    const query = db
      .select()
      .from(products)
      .where(category ? and(eq(products.listed, true), eq(products.category, category)) : eq(products.listed, true))
      .orderBy(order, desc(products.id));
    const rows = limit ? await query.limit(limit) : await query;
    return withVariants(rows, await variantsFor(rows));
  },
  ["store-products"],
  { tags: ["products"], revalidate: TTL },
);

export const getFeaturedProducts = unstable_cache(
  async (limit = 4): Promise<StoreProduct[]> => {
    // Las dos consultas en paralelo: si hay pocos destacados, se completa con los más nuevos.
    const [featured, latest] = await Promise.all([
      db
        .select()
        .from(products)
        .where(and(eq(products.listed, true), eq(products.featured, true)))
        .orderBy(desc(products.createdAt))
        .limit(limit),
      db.select().from(products).where(eq(products.listed, true)).orderBy(desc(products.createdAt)).limit(limit),
    ]);
    const ids = new Set(featured.map((r) => r.id));
    const rows = [...featured, ...latest.filter((r) => !ids.has(r.id))].slice(0, limit);
    return withVariants(rows, await variantsFor(rows));
  },
  ["featured-products"],
  { tags: ["products"], revalidate: TTL },
);

export const getProductBySlug = unstable_cache(
  async (slug: string): Promise<StoreProduct | null> => {
    const [p] = await db
      .select()
      .from(products)
      .where(and(eq(products.slug, slug), eq(products.listed, true)))
      .limit(1);
    if (!p) return null;
    const vs = await db.select().from(variants).where(eq(variants.productId, p.id)).orderBy(asc(variants.id));
    return withVariants([p], vs)[0];
  },
  ["product-by-slug"],
  { tags: ["products"], revalidate: TTL },
);

export const getCategories = unstable_cache(
  async () =>
    db
      .select({ name: products.category, total: count() })
      .from(products)
      .where(eq(products.listed, true))
      .groupBy(products.category)
      .orderBy(asc(products.category)),
  ["store-categories"],
  { tags: ["products"], revalidate: TTL },
);

/* ───────────── Ajustes ───────────── */

export type StoreSettings = {
  storeOpen: boolean;
  shippingFlat: number;
  freeShippingFrom: number;
  lowStockThreshold: number;
};

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

export const getStoreSettings = unstable_cache(async (): Promise<StoreSettings> => readSettings(), ["store-settings"], {
  tags: ["settings"],
  revalidate: TTL,
});

/* ───────────── Secciones de la home ───────────── */

/** Lectura directa (sin caché) para el panel. */
export async function readHomeSections(): Promise<HomeSectionConfig[]> {
  const [row] = await db.select().from(settings).where(eq(settings.key, HOME_SECTIONS_KEY)).limit(1);
  return normalizeHomeSections(row?.value);
}

export const getHomeSections = unstable_cache(async (): Promise<HomeSectionConfig[]> => readHomeSections(), ["home-sections"], {
  tags: ["settings"],
  revalidate: TTL,
});

/* ───────────── Pop-ups ───────────── */

export const getActivePopups = unstable_cache(
  async () => {
    const rows = await db.select().from(popups).where(eq(popups.active, true)).orderBy(desc(popups.id));
    // La ventana de fechas se evalúa en el navegador.
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
  },
  ["active-popups"],
  { tags: ["popups"], revalidate: TTL },
);

export type PublicPopup = Awaited<ReturnType<typeof getActivePopups>>[number];