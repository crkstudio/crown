import Link from "next/link";
import { ProductImage } from "./product-image";
import type { StoreProduct } from "@/lib/queries";
import { discountPercent, formatPrice } from "@/lib/utils";

export function ProductCard({ product, priority }: { product: StoreProduct; priority?: boolean }) {
  const off = discountPercent(product.price, product.compareAtPrice);
  const cover = product.images[0];
  const hover = product.images[1];

  return (
    <article className="group">
      <Link href={`/tienda/${product.slug}`} className="block">
        <div className="relative">
          <ProductImage
            src={cover}
            alt={product.name}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            priority={priority}
            className="aspect-[4/5] rounded-2xl"
          />
          {hover && (
            <ProductImage
              src={hover}
              alt=""
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="absolute inset-0 aspect-[4/5] rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          )}
          {(!product.inStock || off > 0) && (
            <span className="absolute top-3 left-3 rounded-full bg-white px-2.5 py-1 text-xs font-bold shadow-sm">
              {!product.inStock ? "Agotado" : `-${off}%`}
            </span>
          )}
        </div>
        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold leading-snug group-hover:underline group-hover:underline-offset-4">{product.name}</h3>
            <p className="text-sm text-muted">{product.category}</p>
          </div>
          <p className="text-right whitespace-nowrap">
            <span className="font-semibold">{formatPrice(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="block text-sm text-muted line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
          </p>
        </div>
      </Link>
    </article>
  );
}
