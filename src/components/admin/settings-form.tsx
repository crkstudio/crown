"use client";

import { useActionState, useState, useTransition } from "react";
import { saveSettings, type SettingsState } from "@/app/actions/admin/settings";
import { changePassword } from "@/app/actions/auth";
import { Switch } from "./product-row-actions";
import type { StoreSettings } from "@/lib/queries";

export function SettingsForm({ settings, paymentsReady }: { settings: StoreSettings; paymentsReady: boolean }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(saveSettings, {});
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(settings.storeOpen);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
      className="space-y-6"
    >
      <section className="panel p-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="font-bold">Tienda abierta para comprar</h2>
            <p className="mt-1 max-w-lg text-sm text-muted">
              Mientras esté apagada, los clientes pueden ver productos y armar el carrito, pero el checkout no confirma compras ni toca el stock.
            </p>
          </div>
          <Switch checked={open} onChange={setOpen} label="Tienda abierta para comprar" />
          {open && <input type="hidden" name="storeOpen" value="on" />}
        </div>
        {open && !paymentsReady && (
          <p role="alert" className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
            Todavía no cargaste las credenciales de Mercado Pago (MP_ACCESS_TOKEN en .env.local). El checkout va a avisar que los pagos no están configurados.
          </p>
        )}
      </section>

      <section className="panel space-y-5 p-6">
        <h2 className="font-bold">Envíos y stock</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="shippingFlat" className="mb-1.5 block text-sm font-semibold">
              Costo de envío (ARS)
            </label>
            <input id="shippingFlat" name="shippingFlat" inputMode="numeric" defaultValue={settings.shippingFlat} className="field" />
          </div>
          <div>
            <label htmlFor="freeShippingFrom" className="mb-1.5 block text-sm font-semibold">
              Envío gratis desde (ARS)
            </label>
            <input id="freeShippingFrom" name="freeShippingFrom" inputMode="numeric" defaultValue={settings.freeShippingFrom} className="field" />
          </div>
          <div>
            <label htmlFor="lowStockThreshold" className="mb-1.5 block text-sm font-semibold">
              Avisar stock bajo desde (unidades)
            </label>
            <input id="lowStockThreshold" name="lowStockThreshold" inputMode="numeric" defaultValue={settings.lowStockThreshold} className="field" />
          </div>
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className="btn btn-primary px-8">
          {pending ? "Guardando…" : "Guardar ajustes"}
        </button>
        {state.ok && (
          <p role="status" className="text-sm font-semibold text-emerald-800">
            Ajustes guardados.
          </p>
        )}
        {state.error && (
          <p role="alert" className="text-sm font-semibold text-rose-700">
            {state.error}
          </p>
        )}
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, {});
  return (
    <form action={action} className="panel max-w-xl space-y-4 p-6">
      <h2 className="font-bold">Cambiar contraseña</h2>
      <div>
        <label htmlFor="current" className="mb-1.5 block text-sm font-semibold">
          Contraseña actual
        </label>
        <input id="current" name="current" type="password" autoComplete="current-password" required className="field" />
      </div>
      <div>
        <label htmlFor="next" className="mb-1.5 block text-sm font-semibold">
          Nueva contraseña <span className="font-normal text-muted">(mínimo 10 caracteres)</span>
        </label>
        <input id="next" name="next" type="password" autoComplete="new-password" required minLength={10} className="field" />
      </div>
      {state.error && (
        <p role="alert" className="text-sm font-semibold text-rose-700">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p role="status" className="text-sm font-semibold text-emerald-800">
          Contraseña actualizada.
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-outline">
        {pending ? "Actualizando…" : "Actualizar contraseña"}
      </button>
    </form>
  );
}
