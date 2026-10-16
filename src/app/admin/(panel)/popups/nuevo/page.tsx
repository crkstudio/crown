import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { EMPTY_POPUP, PopupForm } from "@/components/admin/popup-form";
import { createPopup } from "@/app/actions/admin/popups";

export const metadata = { title: "Nuevo pop-up" };

export default function NewPopupPage() {
  return (
    <>
      <Link href="/admin/popups" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold hover:underline">
        <ChevronLeft size={16} /> Pop-ups
      </Link>
      <PageHeader title="Nuevo pop-up" />
      <PopupForm action={createPopup} initial={EMPTY_POPUP} submitLabel="Crear pop-up" />
    </>
  );
}
