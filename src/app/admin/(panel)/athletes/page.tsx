import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { CrownMark } from "@/components/crown-logo";
import { EmptyState, PageHeader, TableWrap, td, th, trow } from "@/components/admin/ui";
import { AthleteMoveButtons, AthleteVisibleSwitch, DeleteAthleteButton } from "@/components/admin/athlete-row-actions";
import { getAdminAthletes } from "@/lib/admin-queries";

export const metadata = { title: "Athletes" };

const NOTICE: Record<string, string> = { creado: "Athlete creado.", guardado: "Cambios guardados.", eliminado: "Athlete eliminado." };

export default async function AthletesAdminPage(props: PageProps<"/admin/athletes">) {
  const sp = await props.searchParams;
  const ok = typeof sp.ok === "string" ? NOTICE[sp.ok] : undefined;
  const rows = await getAdminAthletes();

  return (
    <>
      <PageHeader
        title="Athletes"
        description="Las personas que entrenan con crown. El orden de acá es el que se ve en la tienda; en el inicio aparecen los primeros 4."
        actions={
          <Link href="/admin/athletes/nuevo" className="btn btn-primary">
            <Plus size={18} aria-hidden /> Nuevo athlete
          </Link>
        }
      />
      {ok && (
        <p role="status" className="mb-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
          {ok}
        </p>
      )}

      {rows.length === 0 ? (
        <EmptyState title="Todavía no cargaste athletes">
          <Link href="/admin/athletes/nuevo" className="btn btn-primary">
            Cargar el primero
          </Link>
        </EmptyState>
      ) : (
        <TableWrap>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className={th}>Athlete</th>
                <th className={th}>Orden</th>
                <th className={th}>En la tienda</th>
                <th className={th}>
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a, i) => (
                <tr key={a.id} className={trow}>
                  <td className={td}>
                    <div className="flex items-center gap-3">
                      <div className="relative grid h-14 w-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-surface">
                        {a.image ? <Image src={a.image} alt="" fill sizes="44px" className="object-cover" /> : <CrownMark className="w-6 text-black/15" />}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/admin/athletes/${a.id}`} className="block font-semibold hover:underline">
                          {a.name}
                        </Link>
                        <span className="text-muted">{a.sport}</span>
                      </div>
                    </div>
                  </td>
                  <td className={td}>
                    <AthleteMoveButtons id={a.id} name={a.name} first={i === 0} last={i === rows.length - 1} />
                  </td>
                  <td className={td}>
                    <AthleteVisibleSwitch id={a.id} visible={a.visible} name={a.name} />
                  </td>
                  <td className={`${td} text-right whitespace-nowrap`}>
                    <Link href={`/admin/athletes/${a.id}`} className="btn btn-outline btn-sm mr-2">
                      Editar
                    </Link>
                    <DeleteAthleteButton id={a.id} name={a.name} />
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