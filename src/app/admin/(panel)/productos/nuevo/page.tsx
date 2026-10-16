import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { EMPTY_PRODUCT, ProductForm } from "@/components/admin/product-form";
import { createProduct } from "@/app/actions/admin/products";
import { getProductCategories } from "@/lib/admin-queries";

export const metadata = { title: "Nuevo producto" };

export default async function NewProductPage() {
  const categories = await getProductCategories();
  return (
    <>
      <Link href="/admin/productos" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold hover:underline">
        <ChevronLeft size={16} /> Productos
      </Link>
      <PageHeader title="Nuevo producto" />
      <ProductForm action={createProduct} initial={EMPTY_PRODUCT} categories={categories} submitLabel="Crear producto" />
    </>
  );
}
