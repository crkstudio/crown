import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/json-ld";
import { LEGAL_LINKS } from "@/lib/legal";
import { getStoreProducts } from "@/lib/queries";

// Lee productos de la base: se genera en cada pedido (la consulta ya está cacheada), no en el build.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const products = await getStoreProducts();

  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/tienda`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/athletes`, changeFrequency: "monthly", priority: 0.5 },
    ...products.map((p) => ({
      url: `${base}/tienda/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...LEGAL_LINKS.map((l) => ({ url: `${base}/legales/${l.slug}`, changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
