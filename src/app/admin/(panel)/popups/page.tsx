import Link from "next/link";
import { Plus } from "lucide-react";
import { EmptyState, PageHeader, TableWrap, td, th, trow } from "@/components/admin/ui";
import { DeletePopupButton, PopupActiveSwitch } from "@/components/admin/popup-row-actions";
import { getAdminPopups } from "@/lib/admin-queries";
import { AUDIENCE_LABEL, TRIGGER_LABEL } from "@/lib/labels";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Pop-ups" };

const NOTICE: Record<string, string> = { creado: "Pop-up creado.", guardado: "Cambios guardados.", eliminado: "Pop-up eliminado." };

export default async function PopupsPage(props: PageProps<"/admin/popups">) {
  const sp = await props.searchParams;
  const ok = typeof sp.ok === "string" ? NOTICE[sp.ok] : undefined;
  const rows = await getAdminPopups();

  return (
    <>
      <PageHeader
        title="Pop-ups comerciales"
        description="Mensajes que aparecen en la tienda, por ejemplo un descuento de bienvenida para quien entra por primera vez."
        actions={
          <Link href="/admin/popups/nuevo" className="btn btn-primary">
            <Plus size={18} aria-hidden /> Nuevo pop-up
          </Link>
        }
      />
      {ok && (
        <p role="status" className="mb-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
          {ok}
        </p>
      )}
      {rows.length === 0 ? (
        <EmptyState title="Todavía no creaste pop-ups">
          <Link href="/admin/popups/nuevo" className="btn btn-primary">
            Crear el primero
          </Link>
        </EmptyState>
      ) : (
        <TableWrap>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className={th}>Pop-up</th>
                <th className={th}>Cuándo y a quién</th>
                <th className={th}>Vistas</th>
                <th className={th}>Conversión</th>
                <th className={th}>Estado</th>
                <th className={th}>
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className={trow}>
                  <td className={td}>
                    <Link href={`/admin/popups/${p.id}`} className="font-semibold hover:underline">
                      {p.name}
                    </Link>
                    <span className="block max-w-xs truncate text-muted">{p.title}</span>
                    {p.discountCode && <span className="mt-1 inline-block rounded-md bg-neutral-100 px-1.5 py-0.5 text-xs font-bold tracking-wider">{p.discountCode}</span>}
                  </td>
                  <td className={`${td} text-muted`}>
                    {AUDIENCE_LABEL[p.audience]}
                    <span className="block">
                      {TRIGGER_LABEL[p.trigger]}
                      {p.trigger === "delay" && ` (${p.delaySeconds} s)`}
                    </span>
                    {(p.startsAt || p.endsAt) && (
                      <span className="block">
                        {p.startsAt ? formatDate(p.startsAt) : "…"} → {p.endsAt ? formatDate(p.endsAt) : "…"}
                      </span>
                    )}
                  </td>
                  <td className={td}>{p.views}</td>
                  <td className={td}>
                    <span className="font-semibold">{p.views ? `${Math.round((p.conversions / p.views) * 100)}%` : "—"}</span>
                    <span className="block text-muted">{p.conversions} {p.collectEmail ? "emails" : "clics"}</span>
                  </td>
                  <td className={td}>
                    <PopupActiveSwitch id={p.id} active={p.active} name={p.name} />
                  </td>
                  <td className={`${td} text-right whitespace-nowrap`}>
                    <Link href={`/admin/popups/${p.id}`} className="btn btn-outline btn-sm mr-2">
                      Editar
                    </Link>
                    <DeletePopupButton id={p.id} name={p.name} />
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
