import { PageHeader } from "@/components/admin/ui";
import { HomeSectionsForm } from "@/components/admin/home-sections-form";
import { getAdminHomeSections } from "@/lib/admin-queries";

export const metadata = { title: "Página de inicio" };

export default async function HomeSectionsPage() {
  const sections = await getAdminHomeSections();
  return (
    <>
      <PageHeader
        title="Página de inicio"
        description="Elegí qué secciones se ven en la portada de la tienda y en qué orden. Los cambios se publican al guardar."
      />
      <HomeSectionsForm initial={sections} />
    </>
  );
}
