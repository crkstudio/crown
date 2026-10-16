import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { CrownMark } from "@/components/crown-logo";
import { EmptyState, PageHeader, Pill, TableWrap, td, th, trow } from "@/components/admin/ui";
import { FilterTabs, SearchBox } from "@/components/admin/filters";
import { DeleteProductButton, FeaturedButton, ListedSwitch } from "@/components/admin/product-row-actions";
import { getAdminProducts, type ProductFilter } from "@/lib/admin-queries";
import { formatPrice } from "@/lib/utils";

const TABS: { key: ProductFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "listed", label: "Visibles" },
  { key: "hidden", label: "Ocultos" },
  { key: "soldout", label: "Agotados" },
];

const NOTICE: Record<string, string> = {
  creado: "Producto creado.",
  guardado: "Cambios guardados.",
  eliminado: "Producto eliminado.",
};

export default async function ProductsPage(props: PageProps<"/admin/productos">) {
  const sp = await props.searchParams;
  const filter = TABS.some((t) => t.key === sp.filtro) ? (sp.filtro as ProductFilter) : "all";
  const q = typeof sp.q === "string" ? sp.q : "";
  const ok = typeof sp.ok === "string" ? NOTICE[sp.ok] : undefined;

  const [rows, all] = await Promise.all([getAdminProducts(filter, q), getAdminProducts("all")]);
  const counts: Record<ProductFilter, number> = {
    all: all.length,
    listed: all.filter((p) => p.listed).length,
    hidden: all.filter((p) => !p.listed).length,
    soldout: all.filter((p) => p.totalStock <= 0).length,
  };

  return (
    <>
      <PageHeader
        title="Productos"
        description="Creá productos, controlá cuáles se ven en la tienda y editá precios y stock."
        actions={
          <Link href="/admin/productos/nuevo" className="btn btn-primary">
            <Plus size={18} aria-hidden /> Nuevo producto
          </Link>
        }
      />
      {ok && (
        <p role="status" className="mb-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
          {ok}
        </p>
      )}

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs base="/admin/productos" tabs={TABS.map((t) => ({ ...t, count: counts[t.key as ProductFilter] }))} current={filter} extra={{ q }} />
        <SearchBox action="/admin/productos" q={q} placeholder="Buscar por nombre o categoría" hidden={{ filtro: filter === "all" ? undefined : filter }} />
      </div>

      {rows.length === 0 ? (
        <EmptyState title={q || filter !== "all" ? "No hay productos con ese filtro" : "Todavía no cargaste productos"}>
          <Link href="/admin/productos/nuevo" className="btn btn-primary">
            Crear el primero
          </Link>
        </EmptyState>
      ) : (
        <TableWrap>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className={th}>Producto</th>
                <th className={th}>Precio</th>
                <th className={th}>Stock</th>
                <th className={th}>En la tienda</th>
                <th className={th}>Inicio</th>
                <th className={th}>
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className={trow}>
                  <td className={td}>
                    <div className="flex items-center gap-3">
                      <div className="relative grid h-14 w-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-surface">
                        {p.images[0] ? <Image src={p.images[0]} alt="" fill sizes="44px" className="object-cover" /> : <CrownMark className="w-6 text-black/15" />}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/admin/productos/${p.id}`} className="block font-semibold hover:underline">
                          {p.name}
                        </Link>
                        <span className="text-muted">
                          {p.category} · {p.variantCount} {p.variantCount === 1 ? "variante" : "variantes"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className={`${td} whitespace-nowrap`}>
                    <span className="font-semibold">{formatPrice(p.price)}</span>
                    {p.compareAtPrice && <span className="ml-2 text-muted line-through">{formatPrice(p.compareAtPrice)}</span>}
                  </td>
                  <td className={td}>{p.totalStock <= 0 ? <Pill tone="bad">Agotado</Pill> : <span className="font-semibold">{p.totalStock}</span>}</td>
                  <td className={td}>
                    <ListedSwitch id={p.id} listed={p.listed} name={p.name} />
                  </td>
                  <td className={td}>
                    <FeaturedButton id={p.id} featured={p.featured} name={p.name} />
                  </td>
                  <td className={`${td} text-right whitespace-nowrap`}>
                    <Link href={`/admin/productos/${p.id}`} className="btn btn-outline btn-sm mr-2">
                      Editar
                    </Link>
                    <DeleteProductButton id={p.id} name={p.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}
    </>
  );
}
