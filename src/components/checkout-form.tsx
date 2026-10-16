"use client";

import { useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CrownMark } from "./crown-logo";
import { placeOrder, type CheckoutState } from "@/app/actions/checkout";
import { cartSubtotal, shippingFor, useCart, useHydrated } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";

const PROVINCES = [
  "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja",
  "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero",
  "Tierra del Fuego", "Tucumán",
];

function Field({
  name,
  label,
  type = "text",
  autoComplete,
  span,
  error,
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  span?: boolean;
  error?: string;
  defaultValue?: string;
}) {
  return (
    <div className={span ? "sm:col-span-2" : ""}>
      <label htmlFor={name} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        required
        className="field"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-sm font-medium text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}

export function CheckoutForm({
  storeOpen,
  shippingFlat,
  freeShippingFrom,
  paymentFailed,
}: {
  storeOpen: boolean;
  shippingFlat: number;
  freeShippingFrom: number;
  paymentFailed: boolean;
}) {
  const hydrated = useHydrated();
  const lines = useCart((s) => s.lines);
  const [state, action, pending] = useActionState<CheckoutState, FormData>(placeOrder, {});

  const items = hydrated ? lines : [];
  const subtotal = cartSubtotal(items);
  const shipping = shippingFor(subtotal, shippingFlat, freeShippingFrom);
  const total = subtotal + shipping;
  const fe = state.fieldErrors ?? {};
  const v = state.values ?? {};

  if (hydrated && items.length === 0) {
    return (
      <div className="mt-16 flex flex-col items-center gap-5 rounded-3xl bg-surface px-6 py-24 text-center">
        <CrownMark className="w-24 text-black/15" />
        <p className="text-xl font-semibold">Tu carrito está vacío</p>
        <Link href="/tienda" className="btn btn-primary">
          Ver la tienda
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="mt-12 grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
      <input type="hidden" name="items" value={JSON.stringify(items.map((l) => ({ variantId: l.variantId, quantity: l.quantity })))} />

      <div className="space-y-10">
        {!storeOpen && (
          <div role="status" className="rounded-2xl border border-black p-5">
            <p className="font-semibold">La tienda abre pronto</p>
            <p className="mt-1 text-sm text-muted">Podés dejar el carrito listo. Todavía no se pueden confirmar compras.</p>
          </div>
        )}
        {paymentFailed && (
          <div role="alert" className="rounded-2xl border border-rose-300 bg-rose-50 p-5 text-sm font-medium text-rose-800">
            El pago no se completó. Podés intentarlo de nuevo.
          </div>
        )}
        {state.error && (
          <div role="alert" className="rounded-2xl border border-rose-300 bg-rose-50 p-5 text-sm font-medium text-rose-800">
            {state.error}
          </div>
        )}

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="display-md mb-4 text-2xl">Contacto</legend>
          <Field name="email" label="Email" type="email" autoComplete="email" span error={fe.email} defaultValue={v.email} />
          <Field name="name" label="Nombre y apellido" autoComplete="name" error={fe.name} defaultValue={v.name} />
          <Field name="phone" label="Teléfono" type="tel" autoComplete="tel" error={fe.phone} defaultValue={v.phone} />
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="display-md mb-4 text-2xl">Envío</legend>
          <Field name="address" label="Calle y número" autoComplete="street-address" span error={fe.address} defaultValue={v.address} />
          <Field name="city" label="Ciudad" autoComplete="address-level2" error={fe.city} defaultValue={v.city} />
          <div>
            <label htmlFor="province" className="mb-1.5 block text-sm font-semibold">
              Provincia
            </label>
            <select id="province" name="province" required defaultValue={v.province ?? ""} className="field" aria-invalid={fe.province ? true : undefined}>
              <option value="" disabled>
                Elegí una provincia
              </option>
              {PROVINCES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            {fe.province && <p className="mt-1.5 text-sm font-medium text-rose-700">{fe.province}</p>}
          </div>
          <Field name="zip" label="Código postal" autoComplete="postal-code" error={fe.zip} defaultValue={v.zip} />
          <div className="sm:col-span-2">
            <label htmlFor="notes" className="mb-1.5 block text-sm font-semibold">
              Notas para el envío <span className="font-normal text-muted">(opcional)</span>
            </label>
            <textarea id="notes" name="notes" rows={3} maxLength={500} defaultValue={v.notes} className="field resize-none" />
          </div>
        </fieldset>

        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="marketing" defaultChecked={v.marketing === "on"} className="mt-0.5 h-4 w-4 accent-black" />
          <span>Quiero recibir novedades y descuentos de Crown.</span>
        </label>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-3xl bg-surface p-6 sm:p-8">
          <h2 className="display-md text-2xl">Tu pedido</h2>
          <ul className="mt-6 space-y-5">
            {items.map((l) => (
              <li key={l.variantId} className="flex gap-4">
                <div className="relative grid h-20 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-white">
                  {l.image ? <Image src={l.image} alt="" fill sizes="64px" className="object-cover" /> : <CrownMark className="w-8 text-black/15" />}
                  <span className="absolute -top-0 -right-0 grid h-5 min-w-5 place-items-center rounded-bl-lg bg-black px-1 text-[11px] font-bold text-white">
                    {l.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-tight">{l.name}</p>
                  <p className="text-sm text-muted">
                    Talle {l.size} · {l.color}
                  </p>
                </div>
                <p className="text-sm font-semibold whitespace-nowrap">{formatPrice(l.price * l.quantity)}</p>
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-2.5 border-t border-black/10 pt-6 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-semibold">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Envío</dt>
              <dd className="font-semibold">{shipping === 0 ? "Gratis" : formatPrice(shipping)}</dd>
            </div>
            {shipping > 0 && <p className="text-muted">Te faltan {formatPrice(freeShippingFrom - subtotal)} para el envío gratis.</p>}
            <div className="flex items-baseline justify-between border-t border-black/10 pt-4 text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="text-2xl font-bold">{formatPrice(total)}</dd>
            </div>
          </dl>

          <button type="submit" disabled={!storeOpen || pending || items.length === 0} className="btn btn-primary mt-6 w-full py-4 text-base">
            {pending ? "Procesando…" : storeOpen ? "Ir a pagar" : "Compras no habilitadas todavía"}
          </button>
          <p className="mt-3 text-center text-xs text-muted">Vas a pagar de forma segura con Mercado Pago.</p>
        </div>
      </aside>
    </form>
  );
}
