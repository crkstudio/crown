"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { CrownMark } from "./crown-logo";
import { cartCount, cartSubtotal, useCart, useHydrated } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";

/** Carrito lateral. Usa <dialog> nativo: foco atrapado, Esc para cerrar y fondo inerte sin código extra. */
export function CartDrawer() {
  const ref = useRef<HTMLDialogElement>(null);
  const hydrated = useHydrated();
  const { lines, isOpen, close, setQuantity, remove } = useCart();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (isOpen && !d.open) d.showModal();
    if (!isOpen && d.open) d.close();
  }, [isOpen]);

  const items = hydrated ? lines : [];
  const subtotal = cartSubtotal(items);

  return (
    <dialog
      ref={ref}
      onClose={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      aria-label="Carrito de compras"
      className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-black/30 backdrop:backdrop-blur-[2px] open:animate-[fade-in_0.25s_ease-out]"
    >
      <div className="ml-auto flex h-full w-full max-w-[440px] p-3">
        <div className="drawer-panel flex h-full w-full flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <h2 className="display-md text-xl">
              Tu carrito{items.length > 0 && <span className="text-muted"> ({cartCount(items)})</span>}
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar carrito"
              className="grid h-10 w-10 place-items-center rounded-full bg-surface transition-colors hover:bg-black hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 pb-16 text-center">
              <CrownMark className="w-24 text-black/15" />
              <p className="text-lg font-semibold">Tu carrito está vacío</p>
              <Link href="/tienda" onClick={close} className="btn btn-primary">
                Ver la tienda
              </Link>
            </div>
          ) : (
            <>
              <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
                {items.map((l) => (
                  <li key={l.variantId} className="flex gap-4 py-5">
                    <Link
                      href={`/tienda/${l.slug}`}
                      onClick={close}
                      className="relative grid h-24 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-surface"
                    >
                      {l.image ? (
                        <Image src={l.image} alt="" fill sizes="80px" className="object-cover" />
                      ) : (
                        <CrownMark className="w-10 text-black/15" />
                      )}
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <Link href={`/tienda/${l.slug}`} onClick={close} className="font-semibold leading-tight hover:underline">
                          {l.name}
                        </Link>
                        <span className="text-sm font-semibold whitespace-nowrap">{formatPrice(l.price * l.quantity)}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        Talle {l.size} · {l.color}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="flex items-center rounded-full border border-line">
                          <button
                            type="button"
                            aria-label="Quitar una unidad"
                            onClick={() => setQuantity(l.variantId, l.quantity - 1)}
                            className="grid h-8 w-8 place-items-center rounded-full hover:bg-surface"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-7 text-center text-sm font-semibold" aria-live="polite">
                            {l.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Agregar una unidad"
                            disabled={l.quantity >= l.maxStock}
                            onClick={() => setQuantity(l.variantId, l.quantity + 1)}
                            className="grid h-8 w-8 place-items-center rounded-full hover:bg-surface disabled:opacity-30 disabled:hover:bg-transparent"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(l.variantId)}
                          className="text-sm text-muted underline-offset-4 hover:text-black hover:underline"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="space-y-4 border-t border-line px-6 py-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span className="text-xl font-bold">{formatPrice(subtotal)}</span>
                </div>
                <p className="text-sm text-muted">El envío se calcula en el siguiente paso.</p>
                <Link href="/checkout" onClick={close} className="btn btn-primary w-full py-4">
                  Continuar a la compra
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </dialog>
  );
}
