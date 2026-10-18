import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { AthleteForm, EMPTY_ATHLETE } from "@/components/admin/athlete-form";
import { createAthlete } from "@/app/actions/admin/athletes";

export const metadata = { title: "Nuevo athlete" };

export default function NewAthletePage() {
  return (
    <>
      <Link href="/admin/athletes" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold hover:underline">
        <ChevronLeft size={16} /> Athletes
      </Link>
      <PageHeader title="Nuevo athlete" />
      <AthleteForm action={createAthlete} initial={EMPTY_ATHLETE} submitLabel="Crear athlete" />
    </>
  );
}