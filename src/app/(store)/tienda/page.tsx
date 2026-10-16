import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ProductCard } from "@/components/product-card";
import { getCategories, getStoreProducts, type SortKey } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Tienda" };

const SORTS: { key: SortKey; label: string }[] = [
  { key: "nuevos", label: "Más nuevos" },
  { key: "precio-asc", label: "Menor precio" },
  { key: "precio-desc", label: "Mayor precio" },
];

export default function TiendaPage(props: PageProps<"/tienda">) {
  return (
    <div className="mx-auto max-w-[1500px] px-5 pt-32 sm:px-10">
      <h1 className="display text-[clamp(3rem,10vw,9rem)]">Tienda</h1>
      <Suspense fallback={<CatalogSkeleton />}>
        <Catalog searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function Catalog({ searchParams }: Pick<PageProps<"/tienda">, "searchParams">) {
  const params = await searchParams;
  const categories = await getCategories();

  const rawCategory = typeof params.category === "string" ? params.category : undefined;
  const category = categories.some((c) => c.name === rawCategory) ? rawCategory : undefined;
  const rawSort = typeof params.sort === "string" ? params.sort : undefined;
  const sort: SortKey = SORTS.some((s) => s.key === rawSort) ? (rawSort as SortKey) : "nuevos";

  const products = await getStoreProducts(category, sort);

  const href = (c?: string, s: SortKey = sort) => {
    const q = new URLSearchParams();
    if (c) q.set("category", c);
    if (s !== "nuevos") q.set("sort", s);
    const str = q.toString();
    return str ? `/tienda?${str}` : "/tienda";
  };

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors",
      active ? "border-black bg-black text-white" : "border-line hover:border-black",
    );

  return (
    <>
      <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Categorías" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <Link href={href(undefined)} className={chip(!category)} aria-current={!category ? "page" : undefined}>
            Todo
          </Link>
          {categories.map((c) => (
            <Link key={c.name} href={href(c.name)} className={chip(category === c.name)} aria-current={category === c.name ? "page" : undefined}>
              {c.name}
            </Link>
          ))}
        </nav>
        <nav aria-label="Ordenar" className="flex items-center gap-2 text-sm">
          <span className="text-muted">Ordenar:</span>
          {SORTS.map((s) => (
            <Link
              key={s.key}
              href={href(category, s.key)}
              className={cn("underline-offset-4 hover:underline", sort === s.key ? "font-bold underline" : "text-muted")}
            >
              {s.label}
            </Link>
          ))}
        </nav>
      </div>

      {products.length === 0 ? (
        <div className="mt-12 rounded-3xl bg-surface px-6 py-20 text-center">
          <p className="text-xl font-semibold">Todavía no hay productos en esta categoría</p>
          <Link href="/tienda" className="btn btn-primary mt-6">
            Ver todo
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 4} />
          ))}
        </div>
      )}
    </>
  );
}

function CatalogSkeleton() {
  return (
    <div className="mt-24 grid animate-pulse grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4" aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i}>
          <div className="aspect-[4/5] rounded-2xl bg-surface" />
          <div className="mt-3 h-4 w-2/3 rounded bg-surface" />
          <div className="mt-2 h-3 w-1/3 rounded bg-surface" />
        </div>
      ))}
    </div>
  );
}
