import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import { AddToCart } from "@/components/add-to-cart";
import { ProductImage } from "@/components/product-image";
import { getProductBySlug, getStoreSettings } from "@/lib/queries";
import { JsonLd, productJsonLd } from "@/lib/json-ld";
import { discountPercent, formatPrice } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/tienda/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };
  return { title: product.name, description: product.description.slice(0, 155) };
}

export default function ProductPage(props: PageProps<"/tienda/[slug]">) {
  return (
    <div className="mx-auto max-w-[1500px] px-5 pt-28 sm:px-10">
      <Link href="/tienda" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold hover:underline">
        <ChevronLeft size={16} /> Volver a la tienda
      </Link>
      <Suspense fallback={<ProductSkeleton />}>
        <ProductView params={props.params} />
      </Suspense>
    </div>
  );
}

async function ProductView({ params }: Pick<PageProps<"/tienda/[slug]">, "params">) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getStoreSettings()]);
  if (!product) notFound();

  const off = discountPercent(product.price, product.compareAtPrice);
  const images = product.images.length ? product.images : [null];

  return (
    <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
      <JsonLd data={productJsonLd(product)} />
      <div className={images.length > 1 ? "grid grid-cols-2 gap-3" : ""}>
        {images.map((src, i) => (
          <ProductImage
            key={src ?? "placeholder"}
            src={src}
            alt={i === 0 ? product.name : `${product.name}, imagen ${i + 1}`}
            sizes="(min-width: 1024px) 40vw, 100vw"
            priority={i === 0}
            className={`rounded-3xl ${images.length > 1 && i === 0 ? "col-span-2 aspect-[4/3]" : "aspect-[4/5]"}`}
          />
        ))}
      </div>

      <div className="lg:sticky lg:top-28 lg:self-start">
        <p className="text-sm text-muted">{product.category}</p>
        <h1 className="display-md mt-1 text-[clamp(2rem,4vw,3.4rem)]">{product.name}</h1>
        <p className="mt-4 flex items-baseline gap-3">
          <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <>
              <span className="text-lg text-muted line-through">{formatPrice(product.compareAtPrice)}</span>
              <span className="rounded-full bg-black px-2.5 py-1 text-xs font-bold text-white">-{off}%</span>
            </>
          )}
        </p>
        {product.description && <p className="mt-6 max-w-prose leading-relaxed text-muted">{product.description}</p>}

        <div className="mt-8">
          <AddToCart
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: product.images[0] ?? null,
              variants: product.variants.map((v) => ({ id: v.id, size: v.size, color: v.color, stock: v.stock })),
            }}
          />
        </div>

        <ul className="mt-8 space-y-2 border-t border-line pt-6 text-sm text-muted">
          <li>Envío gratis en compras desde {formatPrice(settings.freeShippingFrom)}.</li>
          {!settings.storeOpen && <li className="font-medium text-black">La tienda abre pronto: ya podés armar tu carrito.</li>}
        </ul>
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="grid animate-pulse gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16" aria-hidden>
      <div className="aspect-[4/5] rounded-3xl bg-surface" />
      <div className="space-y-4">
        <div className="h-4 w-24 rounded bg-surface" />
        <div className="h-12 w-3/4 rounded bg-surface" />
        <div className="h-8 w-40 rounded bg-surface" />
        <div className="h-24 rounded bg-surface" />
      </div>
    </div>
  );
}
