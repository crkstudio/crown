import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";
import { DeleteProductButton } from "@/components/admin/product-row-actions";
import { updateProduct } from "@/app/actions/admin/products";
import { getAdminProduct, getProductCategories } from "@/lib/admin-queries";

export const metadata = { title: "Editar producto" };

export default async function EditProductPage(props: PageProps<"/admin/productos/[id]">) {
  const { id: raw } = await props.params;
  const id = Number(raw);
  if (!Number.isInteger(id)) notFound();
  const [product, categories] = await Promise.all([getAdminProduct(id), getProductCategories()]);
  if (!product) notFound();

  return (
    <>
      <Link href="/admin/productos" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold hover:underline">
        <ChevronLeft size={16} /> Productos
      </Link>
      <PageHeader
        title={product.name}
        actions={
          <>
            {product.listed && (
              <Link href={`/tienda/${product.slug}`} target="_blank" className="btn btn-outline btn-sm">
                <ExternalLink size={15} aria-hidden /> Ver en la tienda
              </Link>
            )}
            <DeleteProductButton id={product.id} name={product.name} />
          </>
        }
      />
      <ProductForm
        action={updateProduct.bind(null, product.id)}
        categories={categories}
        submitLabel="Guardar cambios"
        initial={{
          name: product.name,
          category: product.category,
          description: product.description,
          price: String(product.price),
          compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
          listed: product.listed,
          featured: product.featured,
          images: product.images,
          variants: product.variants.map((v) => ({ id: v.id, size: v.size, color: v.color, sku: v.sku ?? "", stock: String(v.stock) })),
        }}
      />
    </>
  );
}
