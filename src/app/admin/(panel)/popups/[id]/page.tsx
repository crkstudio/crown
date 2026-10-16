import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { PopupForm } from "@/components/admin/popup-form";
import { updatePopup } from "@/app/actions/admin/popups";
import { getAdminPopup } from "@/lib/admin-queries";

export const metadata = { title: "Editar pop-up" };

// Las fechas se guardan a las 00:00 de Argentina; se muestran en ese mismo huso.
const dayFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });

export default async function EditPopupPage(props: PageProps<"/admin/popups/[id]">) {
  const { id: raw } = await props.params;
  const id = Number(raw);
  if (!Number.isInteger(id)) notFound();
  const p = await getAdminPopup(id);
  if (!p) notFound();

  return (
    <>
      <Link href="/admin/popups" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold hover:underline">
        <ChevronLeft size={16} /> Pop-ups
      </Link>
      <PageHeader title={p.name} />
      <PopupForm
        action={updatePopup.bind(null, p.id)}
        submitLabel="Guardar cambios"
        initial={{
          name: p.name,
          title: p.title,
          body: p.body,
          ctaLabel: p.ctaLabel,
          ctaUrl: p.ctaUrl ?? "",
          collectEmail: p.collectEmail,
          discountCode: p.discountCode ?? "",
          audience: p.audience,
          trigger: p.trigger,
          delaySeconds: String(p.delaySeconds),
          active: p.active,
          startsAt: p.startsAt ? dayFmt.format(p.startsAt) : "",
          endsAt: p.endsAt ? dayFmt.format(p.endsAt) : "",
        }}
      />
    </>
  );
}
