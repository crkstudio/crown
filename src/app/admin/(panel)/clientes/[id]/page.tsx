import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { PageHeader, Pill, StatusBadge, StatCard, TableWrap, td, th, trow } from "@/components/admin/ui";
import { getAdminCustomer } from "@/lib/admin-queries";
import { REVENUE_STATUSES, SOURCE_LABEL } from "@/lib/labels";
import { formatDate, formatDateTime, formatPrice } from "@/lib/utils";

export const metadata = { title: "Cliente" };

export default async function CustomerPage(props: PageProps<"/admin/clientes/[id]">) {
  const { id: raw } = await props.params;
  const id = Number(raw);
  if (!Number.isInteger(id)) notFound();
  const c = await getAdminCustomer(id);
  if (!c) notFound();

  const paid = c.orders.filter((o) => REVENUE_STATUSES.includes(o.status));
  const spent = paid.reduce((n, o) => n + o.total, 0);

  return (
    <>
      <Link href="/admin/clientes" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold hover:underline">
        <ChevronLeft size={16} /> Clientes
      </Link>
      <PageHeader title={c.name ?? "Sin nombre"} description={c.email} />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Gastó" value={formatPrice(spent)} />
        <StatCard label="Pedidos pagados" value={paid.length} />
        <StatCard label="Origen" value={<span className="text-xl">{SOURCE_LABEL[c.source] ?? c.source}</span>} />
        <StatCard label="Alta" value={<span className="text-xl">{formatDate(c.createdAt)}</span>} />
      </div>

      <section className="panel mb-6 p-6 text-sm">
        <dl className="grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="font-semibold">
              <a href={`mailto:${c.email}`} className="hover:underline">
                {c.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-muted">Teléfono</dt>
            <dd className="font-semibold">{c.phone ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">Acepta novedades</dt>
            <dd>{c.marketingOptIn ? <Pill tone="good">Sí</Pill> : <Pill>No</Pill>}</dd>
          </div>
        </dl>
      </section>

      <h2 className="mb-3 font-bold">Pedidos</h2>
      {c.orders.length === 0 ? (
        <p className="panel px-6 py-10 text-center text-muted">Todavía no compró.</p>
      ) : (
        <TableWrap>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className={th}>Pedido</th>
                <th className={th}>Fecha</th>
                <th className={th}>Estado</th>
                <th className={`${th} text-right`}>Total</th>
              </tr>
            </thead>
            <tbody>
              {c.orders.map((o) => (
                <tr key={o.id} className={trow}>
                  <td className={td}>
                    <Link href={`/admin/ventas/${o.id}`} className="font-bold hover:underline">
                      #{o.number}
                    </Link>
                  </td>
                  <td className={`${td} text-muted`}>{formatDateTime(o.createdAt)}</td>
                  <td className={td}>
                    <StatusBadge status={o.status} />
                  </td>
                  <td className={`${td} text-right font-semibold`}>{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}
    </>
  );
}
