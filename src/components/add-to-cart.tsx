"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

type VariantLite = { id: number; size: string; color: string; stock: number };

export function AddToCart({
  product,
}: {
  product: { id: number; slug: string; name: string; price: number; image: string | null; variants: VariantLite[] };
}) {
  const add = useCart((s) => s.add);
  const { variants } = product;

  const colors = useMemo(() => [...new Set(variants.map((v) => v.color))], [variants]);
  const initialColor = colors.find((c) => variants.some((v) => v.color === c && v.stock > 0)) ?? colors[0];
  const [color, setColor] = useState(initialColor);

  const sizesForColor = variants.filter((v) => v.color === color);
  const [size, setSize] = useState(() => (sizesForColor.find((v) => v.stock > 0) ?? sizesForColor[0])?.size);
  const [justAdded, setJustAdded] = useState(false);

  const selected = variants.find((v) => v.color === color && v.size === size);
  const soldOutEverywhere = variants.every((v) => v.stock <= 0);

  function pickColor(next: string) {
    setColor(next);
    const options = variants.filter((v) => v.color === next);
    // Mantener el talle elegido si existe en el nuevo color; si no, el primero con stock.
    const keep = options.find((v) => v.size === size && v.stock > 0);
    setSize((keep ?? options.find((v) => v.stock > 0) ?? options[0])?.size);
  }

  function handleAdd() {
    if (!selected || selected.stock <= 0) return;
    add({
      variantId: selected.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      size: selected.size,
      color: selected.color,
      price: product.price,
      image: product.image,
      maxStock: selected.stock,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  }

  const chip = (active: boolean, disabled = false) =>
    cn(
      "min-w-12 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors",
      active ? "border-black bg-black text-white" : "border-line hover:border-black",
      disabled && "cursor-not-allowed text-black/30 line-through hover:border-line",
    );

  return (
    <div className="space-y-7">
      {colors.length > 1 && (
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">
            Color: <span className="font-normal text-muted">{color}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button key={c} type="button" aria-pressed={c === color} onClick={() => pickColor(c)} className={chip(c === color)}>
                {c}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="mb-3 text-sm font-semibold">
          Talle: <span className="font-normal text-muted">{size}</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {sizesForColor.map((v) => (
            <button
              key={v.id}
              type="button"
              aria-pressed={v.size === size}
              aria-disabled={v.stock <= 0}
              disabled={v.stock <= 0}
              onClick={() => setSize(v.size)}
              className={chip(v.size === size, v.stock <= 0)}
            >
              {v.size}
            </button>
          ))}
        </div>
        {selected && selected.stock > 0 && selected.stock <= 5 && (
          <p className="mt-3 text-sm font-medium">¡Últimas {selected.stock} {selected.stock === 1 ? "unidad" : "unidades"}!</p>
        )}
      </fieldset>

      <button type="button" onClick={handleAdd} disabled={!selected || selected.stock <= 0} className="btn btn-primary w-full py-4 text-base">
        {soldOutEverywhere ? (
          "Agotado"
        ) : !selected || selected.stock <= 0 ? (
          "Sin stock en esta combinación"
        ) : justAdded ? (
          <>
            <Check size={18} /> Agregado
          </>
        ) : (
          "Agregar al carrito"
        )}
      </button>
    </div>
  );
}
