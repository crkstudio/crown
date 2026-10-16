import Link from "next/link";
import { EmptyState, PageHeader, Pill, TableWrap, td, th, trow } from "@/components/admin/ui";
import { FilterTabs, SearchBox } from "@/components/admin/filters";
import { StockEditor } from "@/components/admin/stock-editor";
import { getStockRows } from "@/lib/admin-queries";

export const metadata = { title: "Stock" };

const KEYS = ["todo", "bajo", "agotado"] as const;
type Key = (typeof KEYS)[number];
const TO_QUERY: Record<Key, "all" | "low" | "out"> = { todo: "all", bajo: "low", agotado: "out" };

export default async function StockPage(props: PageProps<"/admin/stock">) {
  const sp = await props.searchParams;
  const key: Key = KEYS.includes(sp.filtro as Key) ? (sp.filtro as Key) : "todo";
  const q = typeof sp.q === "string" ? sp.q : "";

  const [{ rows, threshold }, everything] = await Promise.all([getStockRows(TO_QUERY[key], q), getStockRows("all")]);
  const counts = {
    todo: everything.rows.length,
    bajo: everything.rows.filter((r) => r.stock > 0 && r.stock <= threshold).length,
    agotado: everything.rows.filter((r) => r.stock <= 0).length,
  };
  const units = everything.rows.reduce((n, r) => n + r.stock, 0);

  return (
    <>
      <PageHeader title="Stock" description={`${units} unidades en total. Tocá el número para editarlo; se guarda solo.`} />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs
          base="/admin/stock"
          current={key}
          extra={{ q }}
          tabs={[
            { key: "todo", label: "Todo", count: counts.todo },
            { key: "bajo", label: `Stock bajo (≤${threshold})`, count: counts.bajo },
            { key: "agotado", label: "Agotados", count: counts.agotado },
          ]}
        />
        <SearchBox action="/admin/stock" q={q} placeholder="Producto, SKU, talle o color" hidden={{ filtro: key === "todo" ? undefined : key }} />
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No hay variantes con ese filtro" />
      ) : (
        <TableWrap>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className={th}>Producto</th>
                <th className={th}>Talle</th>
                <th className={th}>Color</th>
                <th className={th}>SKU</th>
                <th className={th}>Estado</th>
                <th className={th}>Stock</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.variantId} className={trow}>
                  <td className={td}>
                    <Link href={`/admin/productos/${r.productId}`} className="font-semibold hover:underline">
                      {r.name}
                    </Link>
                    {!r.listed && <span className="ml-2 align-middle"><Pill>Oculto</Pill></span>}
                  </td>
                  <td className={td}>{r.size}</td>
                  <td className={td}>{r.color}</td>
                  <td className={`${td} text-muted`}>{r.sku ?? "—"}</td>
                  <td className={td}>{r.stock <= 0 ? <Pill tone="bad">Agotado</Pill> : r.stock <= threshold ? <Pill tone="warn">Stock bajo</Pill> : <Pill tone="good">OK</Pill>}</td>
                  <td className={td}>
                    <StockEditor variantId={r.variantId} stock={r.stock} threshold={threshold} label={`${r.name}, ${r.size}, ${r.color}`} />
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
