"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Plus, Trash2, Upload, X } from "lucide-react";
import type { ProductFormState } from "@/app/actions/admin/products";
import { Switch } from "./product-row-actions";
import { cn } from "@/lib/utils";

export type ProductDraft = {
  name: string;
  category: string;
  description: string;
  price: string;
  compareAtPrice: string;
  listed: boolean;
  featured: boolean;
  images: string[];
  variants: { id?: number; size: string; color: string; sku: string; stock: string }[];
};

export const EMPTY_PRODUCT: ProductDraft = {
  name: "",
  category: "",
  description: "",
  price: "",
  compareAtPrice: "",
  listed: true,
  featured: false,
  images: [],
  variants: [{ size: "M", color: "Negro", sku: "", stock: "0" }],
};

const SIZE_PRESETS = ["XS", "S", "M", "L", "XL", "Único"];

function Err({ id, msg }: { id: string; msg?: string }) {
  return msg ? (
    <p id={id} role="alert" className="mt-1.5 text-sm font-medium text-rose-700">
      {msg}
    </p>
  ) : null;
}

export function ProductForm({
  action,
  initial,
  categories,
  submitLabel,
}: {
  action: (prev: ProductFormState, fd: FormData) => Promise<ProductFormState>;
  initial: ProductDraft;
  categories: string[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [, startTransition] = useTransition();
  const fe = state.fieldErrors ?? {};

  const [listed, setListed] = useState(initial.listed);
  const [featured, setFeatured] = useState(initial.featured);
  const [images, setImages] = useState<string[]>(initial.images);
  const [variants, setVariants] = useState(initial.variants);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setUploadError("");
    const body = new FormData();
    for (const f of Array.from(files)) body.append("files", f);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "No se pudo subir");
      setImages((prev) => [...prev, ...json.urls].slice(0, 8));
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "No se pudo subir");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const move = (i: number, dir: -1 | 1) =>
    setImages((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const patchVariant = (i: number, patch: Partial<ProductDraft["variants"][number]>) =>
    setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));

  return (
    <form
      // Se envía con onSubmit (y no con action=) para que React no vacíe los campos si el servidor devuelve un error de validación.
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => formAction(fd));
      }}
      className="grid gap-6 lg:grid-cols-[1.5fr_1fr]"
    >
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input
        type="hidden"
        name="variants"
        value={JSON.stringify(variants.map((v) => ({ id: v.id, size: v.size, color: v.color, sku: v.sku, stock: Number(v.stock) })))}
      />

      {state.error && (
        <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 lg:col-span-2">
          {state.error}
        </p>
      )}

      <div className="space-y-6">
        <section className="panel space-y-5 p-6">
          <h2 className="font-bold">Datos del producto</h2>
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-semibold">
              Nombre
            </label>
            <input id="name" name="name" defaultValue={initial.name} required className="field" aria-invalid={fe.name ? true : undefined} aria-describedby="name-err" />
            <Err id="name-err" msg={fe.name} />
          </div>
          <div>
            <label htmlFor="category" className="mb-1.5 block text-sm font-semibold">
              Categoría
            </label>
            <input id="category" name="category" list="category-list" defaultValue={initial.category} required className="field" placeholder="Remeras, Shorts, Buzos…" aria-describedby="cat-err" />
            <datalist id="category-list">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <Err id="cat-err" msg={fe.category} />
          </div>
          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-semibold">
              Descripción
            </label>
            <textarea id="description" name="description" rows={5} defaultValue={initial.description} maxLength={3000} className="field resize-y" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="price" className="mb-1.5 block text-sm font-semibold">
                Precio (ARS)
              </label>
              <input id="price" name="price" inputMode="numeric" defaultValue={initial.price} required className="field" placeholder="38900" aria-describedby="price-err" />
              <Err id="price-err" msg={fe.price} />
            </div>
            <div>
              <label htmlFor="compareAtPrice" className="mb-1.5 block text-sm font-semibold">
                Precio anterior <span className="font-normal text-muted">(tachado, opcional)</span>
              </label>
              <input id="compareAtPrice" name="compareAtPrice" inputMode="numeric" defaultValue={initial.compareAtPrice} className="field" aria-describedby="cmp-err" />
              <Err id="cmp-err" msg={fe.compareAtPrice} />
            </div>
          </div>
        </section>

        <section className="panel p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold">Variantes y stock</h2>
              <p className="text-sm text-muted">Cada talle y color tiene su propio stock.</p>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setVariants((p) => [...p, { size: p.at(-1)?.size ?? "M", color: p.at(-1)?.color ?? "Negro", sku: "", stock: "0" }])}
            >
              <Plus size={16} aria-hidden /> Agregar
            </button>
          </div>
          <Err id="variants-err" msg={fe.variants} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr>
                  <th className="pb-2 text-left text-xs font-semibold text-muted">Talle</th>
                  <th className="pb-2 pl-2 text-left text-xs font-semibold text-muted">Color</th>
                  <th className="pb-2 pl-2 text-left text-xs font-semibold text-muted">SKU</th>
                  <th className="pb-2 pl-2 text-left text-xs font-semibold text-muted">Stock</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {variants.map((v, i) => (
                  <tr key={v.id ?? `new-${i}`}>
                    <td className="py-1 pr-0">
                      <input aria-label={`Talle de la variante ${i + 1}`} list="size-presets" value={v.size} onChange={(e) => patchVariant(i, { size: e.target.value })} className="field !px-3 !py-2" />
                    </td>
                    <td className="py-1 pl-2">
                      <input aria-label={`Color de la variante ${i + 1}`} value={v.color} onChange={(e) => patchVariant(i, { color: e.target.value })} className="field !px-3 !py-2" />
                    </td>
                    <td className="py-1 pl-2">
                      <input aria-label={`SKU de la variante ${i + 1}`} value={v.sku} onChange={(e) => patchVariant(i, { sku: e.target.value })} className="field !px-3 !py-2" placeholder="Opcional" />
                    </td>
                    <td className="py-1 pl-2">
                      <input
                        aria-label={`Stock de la variante ${i + 1}`}
                        inputMode="numeric"
                        value={v.stock}
                        onChange={(e) => patchVariant(i, { stock: e.target.value })}
                        className={cn("field !w-24 !px-3 !py-2", Number(v.stock) <= 0 && "border-rose-300")}
                      />
                    </td>
                    <td className="py-1 pl-1 text-right">
                      <button
                        type="button"
                        aria-label={`Quitar variante ${i + 1}`}
                        disabled={variants.length === 1}
                        onClick={() => setVariants((p) => p.filter((_, idx) => idx !== i))}
                        className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-rose-50 hover:text-rose-700 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <datalist id="size-presets">
              {SIZE_PRESETS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="panel space-y-4 p-6">
          <h2 className="font-bold">Visibilidad</h2>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Mostrar en la tienda</p>
              <p className="text-sm text-muted">Si lo apagás, queda guardado pero nadie lo ve.</p>
            </div>
            <Switch checked={listed} onChange={setListed} label="Mostrar en la tienda" />
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-line pt-4">
            <div>
              <p className="text-sm font-semibold">Destacar en el inicio</p>
              <p className="text-sm text-muted">Aparece en la primera fila del home.</p>
            </div>
            <Switch checked={featured} onChange={setFeatured} label="Destacar en el inicio" />
          </div>
          {listed && <input type="hidden" name="listed" value="on" />}
          {featured && <input type="hidden" name="featured" value="on" />}
        </section>

        <section className="panel p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold">Fotos</h2>
              <p className="text-sm text-muted">La primera es la portada. Hasta 8, JPG/PNG/WebP.</p>
            </div>
          </div>
          {images.length > 0 && (
            <ul className="mb-4 grid grid-cols-3 gap-2.5">
              {images.map((src, i) => (
                <li key={src} className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-surface">
                  <Image src={src} alt={`Foto ${i + 1}`} fill sizes="120px" className="object-cover" />
                  {i === 0 && <span className="absolute top-1.5 left-1.5 rounded-full bg-black px-2 py-0.5 text-[10px] font-bold text-white">Portada</span>}
                  <button
                    type="button"
                    aria-label={`Quitar foto ${i + 1}`}
                    onClick={() => setImages((p) => p.filter((_, idx) => idx !== i))}
                    className="absolute top-1.5 right-1.5 grid h-6 w-6 place-items-center rounded-full bg-white/90 shadow hover:bg-black hover:text-white"
                  >
                    <X size={13} />
                  </button>
                  <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                    <button type="button" aria-label="Mover a la izquierda" disabled={i === 0} onClick={() => move(i, -1)} className="grid h-6 w-6 place-items-center rounded-full bg-white/90 shadow disabled:opacity-30">
                      <ArrowLeft size={13} />
                    </button>
                    <button type="button" aria-label="Mover a la derecha" disabled={i === images.length - 1} onClick={() => move(i, 1)} className="grid h-6 w-6 place-items-center rounded-full bg-white/90 shadow disabled:opacity-30">
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <input ref={fileRef} id="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => upload(e.target.files)} disabled={uploading || images.length >= 8} />
          <label
            htmlFor="photos"
            className={cn(
              "flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-black/30 px-4 py-6 text-sm font-semibold transition-colors hover:border-black hover:bg-neutral-50 focus-within:outline-2",
              (uploading || images.length >= 8) && "pointer-events-none opacity-50",
            )}
          >
            <Upload size={18} aria-hidden />
            {uploading ? "Subiendo…" : images.length >= 8 ? "Llegaste al máximo" : "Subir fotos"}
          </label>
          {uploadError && (
            <p role="alert" className="mt-2 text-sm font-medium text-rose-700">
              {uploadError}
            </p>
          )}
          <Err id="img-err" msg={fe.images} />
        </section>

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={pending || uploading} className="btn btn-primary flex-1 py-3.5">
            {pending ? "Guardando…" : submitLabel}
          </button>
          <Link href="/admin/productos" className="btn btn-outline py-3.5">
            Cancelar
          </Link>
        </div>
      </div>
    </form>
  );
}
