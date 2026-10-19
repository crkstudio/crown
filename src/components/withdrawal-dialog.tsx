"use client";

import { useActionState, useRef } from "react";
import { X } from "lucide-react";
import { submitWithdrawal, type WithdrawalState } from "@/app/actions/withdrawals";
import { AAIP_NOTICE, LEGAL } from "@/lib/legal";

function Field({
  name,
  label,
  type = "text",
  autoComplete,
  inputMode,
  required = true,
  hint,
  error,
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "tel" | "email";
  required?: boolean;
  hint?: string;
  error?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={`wd-${name}`} className="mb-1.5 block text-sm font-semibold">
        {label} {hint && <span className="font-normal text-muted">({hint})</span>}
      </label>
      <input
        id={`wd-${name}`}
        name={name}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        defaultValue={defaultValue}
        required={required}
        className="field"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `wd-${name}-error` : undefined}
      />
      {error && (
        <p id={`wd-${name}-error`} className="mt-1.5 text-sm font-medium text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * "Botón de arrepentimiento" (Disp. 954/2025): abre un formulario con los datos del cliente y el
 * número de pedido para que el vendedor lo contacte y coordine la devolución y el reembolso.
 */
export function WithdrawalDialog({ orderNumber }: { orderNumber: number }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState<WithdrawalState, FormData>(submitWithdrawal, {});
  const fe = state.fieldErrors ?? {};
  const v = state.values ?? {};

  return (
    <>
      <button type="button" onClick={() => dialogRef.current?.showModal()} className="btn btn-primary px-8 py-4 text-base" aria-haspopup="dialog">
        Botón de arrepentimiento
      </button>
      <p className="mx-auto mt-3 max-w-sm text-sm text-muted">Podés revocar tu compra dentro de los {LEGAL.withdrawalDays} días corridos desde que recibís el producto.</p>

      <dialog
        ref={dialogRef}
        aria-labelledby="wd-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
        className="fixed inset-0 m-auto max-h-[92dvh] w-[calc(100%-2rem)] max-w-[560px] overflow-y-auto rounded-3xl bg-white p-0 text-left backdrop:bg-black/35 backdrop:backdrop-blur-[3px]"
      >
        <div className="relative p-6 sm:p-8">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="absolute top-4 right-4 grid h-9 w-9 place-items-center rounded-full hover:bg-black/[0.06]"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>

          <h2 id="wd-title" className="display-md pr-10 text-2xl">
            Botón de arrepentimiento
          </h2>

          {state.ok ? (
            <div role="status" className="mt-6 space-y-4 text-sm">
              <p className="text-base font-semibold">Recibimos tu solicitud.</p>
              <p className="rounded-2xl bg-surface p-5">
                Código de identificación
                <strong className="mt-1 block text-2xl tracking-wider">{state.code}</strong>
              </p>
              <p className="text-muted">
                Guardalo. Dentro de las 24 horas nos comunicamos con vos por email o teléfono para indicarte cómo devolver el producto y coordinar el reembolso, que se
                acredita en {LEGAL.refundTerm} desde que recibimos la devolución.
              </p>
              <p className="text-muted">
                Si no tenés noticias nuestras, escribinos a {LEGAL.email} o al {LEGAL.phone} ({LEGAL.hours}) indicando el código.
              </p>
              <button type="button" onClick={() => dialogRef.current?.close()} className="btn btn-primary mt-2 w-full">
                Cerrar
              </button>
            </div>
          ) : (
            <form action={action} className="mt-5 space-y-4">
              <p className="text-sm text-muted">
                Completá tus datos y el número de pedido. El vendedor se va a contactar con vos para coordinar la devolución y el reembolso.
              </p>

              {state.error && (
                <div role="alert" className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm font-medium text-rose-800">
                  {state.error}
                </div>
              )}

              <Field name="name" label="Nombre y apellido" autoComplete="name" error={fe.name} defaultValue={v.name} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field name="email" label="Email de la compra" type="email" autoComplete="email" inputMode="email" error={fe.email} defaultValue={v.email} />
                <Field name="phone" label="Teléfono" type="tel" autoComplete="tel" inputMode="tel" required={false} hint="opcional" error={fe.phone} defaultValue={v.phone} />
              </div>
              <Field name="orderNumber" label="Número de pedido" inputMode="numeric" error={fe.orderNumber} defaultValue={v.orderNumber ?? String(orderNumber)} />

              <div>
                <label htmlFor="wd-detail" className="mb-1.5 block text-sm font-semibold">
                  ¿Qué querés devolver?
                </label>
                <textarea
                  id="wd-detail"
                  name="detail"
                  rows={4}
                  maxLength={1000}
                  required
                  defaultValue={v.detail}
                  placeholder="Producto/s, talle y cualquier dato que nos ayude a coordinar el reembolso."
                  className="field resize-none"
                  aria-invalid={fe.detail ? true : undefined}
                  aria-describedby={fe.detail ? "wd-detail-error" : undefined}
                />
                {fe.detail && (
                  <p id="wd-detail-error" className="mt-1.5 text-sm font-medium text-rose-700">
                    {fe.detail}
                  </p>
                )}
              </div>

              <button type="submit" disabled={pending} className="btn btn-primary w-full py-4 text-base">
                {pending ? "Enviando…" : "Enviar solicitud"}
              </button>
              <p className="text-xs text-muted">{AAIP_NOTICE}</p>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
