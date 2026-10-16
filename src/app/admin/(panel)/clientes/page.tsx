import Link from "next/link";
import { Download } from "lucide-react";
import { EmptyState, PageHeader, Pill, StatCard, TableWrap, td, th, trow } from "@/components/admin/ui";
import { FilterTabs, SearchBox } from "@/components/admin/filters";
import { getAdminCustomers } from "@/lib/admin-queries";
import { SOURCE_LABEL } from "@/lib/labels";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata = { title: "Clientes" };

export default async function CustomersPage(props: PageProps<"/admin/clientes">) {
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const marketing = sp.filtro === "marketing";

  const [rows, all] = await Promise.all([getAdminCustomers(q, marketing), getAdminCustomers()]);
  const buyers = all.filter((c) => c.orderCount > 0).length;
  const optIn = all.filter((c) => c.marketingOptIn).length;

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Personas que compraron o dejaron su email en un pop-up."
        actions={
          <a href="/api/admin/customers/export" className="btn btn-outline btn-sm">
            <Download size={15} aria-hidden /> Exportar CSV
          </a>
        }
      />

      <div className="mb-6 grid grid-cols-3 gap-4">
        <StatCard label="Total" value={all.length} />
        <StatCard label="Compraron" value={buyers} />
        <StatCard label="Aceptan novedades" value={optIn} />
      </div>

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs
          base="/admin/clientes"
          current={marketing ? "marketing" : "todos"}
          extra={{ q }}
          tabs={[
            { key: "todos", label: "Todos", count: all.length },
            { key: "marketing", label: "Aceptan novedades", count: optIn },
          ]}
        />
        <SearchBox action="/admin/clientes" q={q} placeholder="Nombre, email o teléfono" hidden={{ filtro: marketing ? "marketing" : undefined }} />
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No hay clientes con ese filtro" />
      ) : (
        <TableWrap>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className={th}>Cliente</th>
                <th className={th}>Origen</th>
                <th className={th}>Pedidos</th>
                <th className={th}>Gastó</th>
                <th className={th}>Novedades</th>
                <th className={th}>Alta</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className={trow}>
                  <td className={td}>
                    <Link href={`/admin/clientes/${c.id}`} className="font-semibold hover:underline">
                      {c.name ?? "Sin nombre"}
                    </Link>
                    <span className="block text-muted">{c.email}</span>
                  </td>
                  <td className={td}>
                    <Pill tone={c.source === "popup" ? "dark" : "neutral"}>{SOURCE_LABEL[c.source] ?? c.source}</Pill>
                  </td>
                  <td className={td}>{c.orderCount}</td>
                  <td className={`${td} font-semibold whitespace-nowrap`}>{c.spent ? formatPrice(c.spent) : "—"}</td>
                  <td className={td}>{c.marketingOptIn ? <Pill tone="good">Sí</Pill> : <span className="text-muted">No</span>}</td>
                  <td className={`${td} whitespace-nowrap text-muted`}>{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}
    </>
  );
}
