import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { PageHeader, StatCard, StatusBadge, td, th, trow, TableWrap, Pill } from "@/components/admin/ui";
import { getDashboard } from "@/lib/admin-queries";
import { formatDateTime, formatPrice } from "@/lib/utils";

export default async function DashboardPage() {
  const d = await getDashboard();

  const series = d.series;
  const max = Math.max(...series.map((s) => s.total), 1);

  return (
    <>
      <PageHeader title="Resumen" description="Cómo viene la tienda en los últimos 30 días." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Ventas (30 días)" value={formatPrice(d.revenue30)} hint={`${d.orders30} pedidos pagados`} />
        <StatCard label="Para enviar" value={d.toShip} hint="Pagados, sin despachar" />
        <StatCard label="Pendientes de pago" value={d.pending} />
        <StatCard label="Clientes" value={d.totalCustomers} hint={`${d.newCustomers} nuevos en 30 días`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="panel p-6" aria-labelledby="chart-title">
          <h2 id="chart-title" className="font-bold">
            Ventas por día
          </h2>
          <p className="text-sm text-muted">Últimos 14 días, en pesos.</p>
          <div className="mt-6 flex h-64 items-end gap-1.5" role="img" aria-label={`Ventas por día: ${series.map((s) => `${s.label}: ${formatPrice(s.total)}`).join(", ")}`}>
            {series.map((s) => (
              <div key={s.key} className="group relative flex h-full flex-1 flex-col justify-end">
                <div
                  className="w-full rounded-t-md bg-black transition-opacity group-hover:opacity-70"
                  style={{ height: `${Math.max((s.total / max) * 100, s.total > 0 ? 4 : 1)}%`, opacity: s.total > 0 ? 1 : 0.12 }}
                />
                <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 rounded-md bg-black px-2 py-1 text-xs font-semibold whitespace-nowrap text-white group-hover:block">
                  {formatPrice(s.total)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-1.5 text-[11px] text-muted" aria-hidden>
            {series.map((s) => (
              <span key={s.key} className="flex-1 text-center">
                {s.label}
              </span>
            ))}
          </div>
        </section>

        <section className="panel p-6" aria-labelledby="stock-title">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="stock-title" className="font-bold">
                Stock bajo
              </h2>
              <p className="text-sm text-muted">{d.threshold} unidades o menos.</p>
            </div>
            {d.lowCount > 0 && <Pill tone="bad">{d.lowCount}</Pill>}
          </div>
          {d.lowStock.length === 0 ? (
            <p className="mt-6 text-sm text-muted">Todo el stock está por encima del mínimo.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {d.lowStock.map((v) => (
                <li key={v.variantId} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="min-w-0">
                    <Link href={`/admin/productos/${v.productId}`} className="block truncate font-semibold hover:underline">
                      {v.name}
                    </Link>
                    <span className="text-muted">
                      {v.size} · {v.color}
                    </span>
                  </span>
                  <span className={v.stock === 0 ? "flex items-center gap-1 font-bold text-rose-700" : "font-bold"}>
                    {v.stock === 0 && <AlertTriangle size={14} aria-hidden />}
                    {v.stock === 0 ? "Agotado" : v.stock}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {d.lowCount > 0 && (
            <Link href="/admin/stock?filtro=bajo" className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">
              Ver todo el stock bajo
            </Link>
          )}
        </section>
      </div>

      <section className="mt-6" aria-labelledby="recent-title">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="recent-title" className="font-bold">
            Últimos pedidos
          </h2>
          <Link href="/admin/ventas" className="text-sm font-semibold underline underline-offset-4">
            Ver todos
          </Link>
        </div>
        <TableWrap>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className={th}>Pedido</th>
                <th className={th}>Cliente</th>
                <th className={th}>Fecha</th>
                <th className={th}>Estado</th>
                <th className={`${th} text-right`}>Total</th>
              </tr>
            </thead>
            <tbody>
              {d.recent.map((o) => (
                <tr key={o.id} className={trow}>
                  <td className={td}>
                    <Link href={`/admin/ventas/${o.id}`} className="font-bold hover:underline">
                      #{o.number}
                    </Link>
                  </td>
                  <td className={td}>{o.customer}</td>
                  <td className={`${td} text-muted`}>{formatDateTime(o.createdAt)}</td>
                  <td className={td}>
                    <StatusBadge status={o.status} />
                  </td>
                  <td className={`${td} text-right font-semibold`}>{formatPrice(o.total)}</td>
                </tr>
              ))}
              {d.recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted">
                    Todavía no hay pedidos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TableWrap>
      </section>
    </>
  );
}
