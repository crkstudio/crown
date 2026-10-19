import Link from "next/link";
import { EmptyState, PageHeader, TableWrap, td, th, trow } from "@/components/admin/ui";
import { WithdrawalStatusSelect } from "@/components/admin/withdrawal-status-select";
import { getAdminWithdrawals } from "@/lib/admin-queries";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Arrepentimientos" };

export default async function WithdrawalsPage() {
  const rows = await getAdminWithdrawals();

  return (
    <>
      <PageHeader
        title="Arrepentimientos"
        description="Solicitudes del botón de arrepentimiento. Contactá al cliente dentro de las 24 horas para coordinar la devolución y el reembolso."
      />

      {rows.length === 0 ? (
        <EmptyState title="Todavía no hay solicitudes" />
      ) : (
        <TableWrap>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className={th}>Código</th>
                <th className={th}>Pedido</th>
                <th className={th}>Cliente</th>
                <th className={th}>Detalle</th>
                <th className={th}>Fecha</th>
                <th className={th}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((w) => (
                <tr key={w.id} className={`${trow} align-top`}>
                  <td className={`${td} font-bold whitespace-nowrap`}>{w.code}</td>
                  <td className={td}>
                    {w.orderId ? (
                      <Link href={`/admin/ventas/${w.orderId}`} className="font-bold hover:underline">
                        #{w.orderNumber}
                      </Link>
                    ) : (
                      <span className="font-bold">#{w.orderNumber}</span>
                    )}
                  </td>
                  <td className={td}>
                    {w.name}
                    <a href={`mailto:${w.email}`} className="block text-muted hover:underline">
                      {w.email}
                    </a>
                    {w.phone && <span className="block text-muted">{w.phone}</span>}
                  </td>
                  <td className={`${td} max-w-xs whitespace-pre-wrap`}>{w.detail}</td>
                  <td className={`${td} whitespace-nowrap text-muted`}>{formatDateTime(w.createdAt)}</td>
                  <td className={td}>
                    <WithdrawalStatusSelect id={w.id} status={w.status} />
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
