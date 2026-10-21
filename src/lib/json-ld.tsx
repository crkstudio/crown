import { LEGAL, SOCIAL } from "@/lib/legal";

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const absolute = (src: string) => (/^https?:\/\//.test(src) ? src : `${siteUrl()}${src.startsWith("/") ? "" : "/"}${src}`);

/** Renderiza datos estructurados. Se escapa "<" para que el JSON no pueda cerrar el <script>. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

const isFilled = (v: string) => !v.startsWith("COMPLETAR");
// Las redes todavía son las URLs genéricas de plantilla: solo se publican cuando son perfiles reales.
const isProfile = (url: string) => new URL(url).pathname.replace(/\//g, "").length > 0;

export function organizationJsonLd() {
  const sameAs = Object.values(SOCIAL).filter(isProfile);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl()}/#organization`,
        name: LEGAL.brand,
        url: siteUrl(),
        ...(isFilled(LEGAL.legalName) && { legalName: LEGAL.legalName }),
        ...(sameAs.length > 0 && { sameAs }),
        ...((isFilled(LEGAL.email) || isFilled(LEGAL.phone)) && {
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            availableLanguage: "es",
            ...(isFilled(LEGAL.email) && { email: LEGAL.email }),
            ...(isFilled(LEGAL.phone) && { telephone: LEGAL.phone }),
          },
        }),
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl()}/#website`,
        url: siteUrl(),
        name: LEGAL.brand,
        inLanguage: "es-AR",
        publisher: { "@id": `${siteUrl()}/#organization` },
      },
    ],
  };
}

type ProductForLd = {
  slug: string;
  name: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  variants: { stock: number }[];
};

export function productJsonLd(p: ProductForLd) {
  const inStock = p.variants.some((v) => v.stock > 0);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    ...(p.description && { description: p.description }),
    category: p.category,
    ...(p.images.length > 0 && { image: p.images.map(absolute) }),
    brand: { "@type": "Brand", name: LEGAL.brand },
    offers: {
      "@type": "Offer",
      url: `${siteUrl()}/tienda/${p.slug}`,
      priceCurrency: "ARS",
      price: p.price,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${siteUrl()}/#organization` },
    },
  };
}
