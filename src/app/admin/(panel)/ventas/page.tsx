import Link from "next/link";
import { EmptyState, PageHeader, StatCard, StatusBadge, TableWrap, td, th, trow } from "@/components/admin/ui";
import { FilterTabs, SearchBox } from "@/components/admin/filters";
import { getAdminOrders, getOrderSummary } from "@/lib/admin-queries";
import { ORDER_STATUSES, type OrderStatus } from "@/db/schema";
import { ORDER_STATUS_LABEL } from "@/lib/labels";
import { formatDateTime, formatPrice } from "@/lib/utils";

export const metadata = { title: "Ventas" };

export default async function SalesPage(props: PageProps<"/admin/ventas">) {
  const sp = await props.searchParams;
  const status: OrderStatus | "all" = ORDER_STATUSES.includes(sp.estado as OrderStatus) ? (sp.estado as OrderStatus) : "all";
  const q = typeof sp.q === "string" ? sp.q : "";

  const [rows, summary] = await Promise.all([getAdminOrders(status, q), getOrderSummary()]);
  const total = ORDER_STATUSES.reduce((n, s) => n + (summary.by[s]?.n ?? 0), 0);

  return (
    <>
      <PageHeader title="Ventas" description="Todos los pedidos. Entrá a uno para ver el detalle y cambiar su estado." />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Facturado" value={formatPrice(summary.revenue)} hint="Pagados, enviados y entregados" />
        <StatCard label="Pedidos pagados" value={summary.paidOrders} />
        <StatCard label="Ticket promedio" value={formatPrice(summary.average)} />
        <StatCard label="Cancelados" value={summary.by.cancelled?.n ?? 0} />
      </div>

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs
          base="/admin/ventas"
          param="estado"
          current={status}
          extra={{ q }}
          tabs={[
            { key: "all", label: "Todos", count: total },
            ...ORDER_STATUSES.map((s) => ({ key: s, label: ORDER_STATUS_LABEL[s], count: summary.by[s]?.n ?? 0 })),
          ]}
        />
        <SearchBox action="/admin/ventas" q={q} placeholder="N° de pedido, nombre o ciudad" hidden={{ estado: status === "all" ? undefined : status }} />
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No hay pedidos con ese filtro" />
      ) : (
        <TableWrap>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className={th}>Pedido</th>
                <th className={th}>Cliente</th>
                <th className={th}>Fecha</th>
                <th className={th}>Unidades</th>
                <th className={th}>Estado</th>
                <th className={`${th} text-right`}>Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id} className={trow}>
                  <td className={td}>
                    <Link href={`/admin/ventas/${o.id}`} className="font-bold hover:underline">
                      #{o.number}
                    </Link>
                  </td>
                  <td className={td}>
                    {o.name}
                    <span className="block text-muted">{o.city}</span>
                  </td>
                  <td className={`${td} whitespace-nowrap text-muted`}>{formatDateTime(o.createdAt)}</td>
                  <td className={td}>{o.items}</td>
                  <td className={td}>
                    <StatusBadge status={o.status} />
                  </td>
                  <td className={`${td} text-right font-semibold whitespace-nowrap`}>{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}
    </>
  );
}
