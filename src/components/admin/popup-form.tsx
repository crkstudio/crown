"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { PopupFormState } from "@/app/actions/admin/popups";
import { PopupCard } from "@/components/popup-card";
import { Switch } from "./product-row-actions";
import { AUDIENCE_LABEL, TRIGGER_LABEL } from "@/lib/labels";

export type PopupDraft = {
  name: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  collectEmail: boolean;
  discountCode: string;
  audience: keyof typeof AUDIENCE_LABEL;
  trigger: keyof typeof TRIGGER_LABEL;
  delaySeconds: string;
  active: boolean;
  startsAt: string;
  endsAt: string;
};

export const EMPTY_POPUP: PopupDraft = {
  name: "",
  title: "Tu primera compra con 10% off",
  body: "Dejanos tu email y te mandamos el código.",
  ctaLabel: "Quiero mi código",
  ctaUrl: "",
  collectEmail: true,
  discountCode: "",
  audience: "new",
  trigger: "delay",
  delaySeconds: "5",
  active: false,
  startsAt: "",
  endsAt: "",
};

function Err({ msg }: { msg?: string }) {
  return msg ? (
    <p role="alert" className="mt-1.5 text-sm font-medium text-rose-700">
      {msg}
    </p>
  ) : null;
}

export function PopupForm({
  action,
  initial,
  submitLabel,
}: {
  action: (prev: PopupFormState, fd: FormData) => Promise<PopupFormState>;
  initial: PopupDraft;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const fe = state.fieldErrors ?? {};
  const [d, setD] = useState(initial);
  const set = <K extends keyof PopupDraft>(k: K, v: PopupDraft[K]) => setD((p) => ({ ...p, [k]: v }));

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      {state.error && (
        <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 lg:col-span-2">
          {state.error}
        </p>
      )}

      <div className="space-y-6">
        <section className="panel space-y-5 p-6">
          <h2 className="font-bold">Mensaje</h2>
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-semibold">
              Nombre interno <span className="font-normal text-muted">(solo lo ve el equipo)</span>
            </label>
            <input id="name" name="name" value={d.name} onChange={(e) => set("name", e.target.value)} required className="field" placeholder="Bienvenida · 10% off" />
            <Err msg={fe.name} />
          </div>
          <div>
            <label htmlFor="title" className="mb-1.5 block text-sm font-semibold">
              Título
            </label>
            <input id="title" name="title" value={d.title} onChange={(e) => set("title", e.target.value)} required maxLength={80} className="field" />
            <Err msg={fe.title} />
          </div>
          <div>
            <label htmlFor="body" className="mb-1.5 block text-sm font-semibold">
              Texto
            </label>
            <textarea id="body" name="body" value={d.body} onChange={(e) => set("body", e.target.value)} rows={3} maxLength={240} className="field resize-none" />
            <p className="mt-1 text-right text-xs text-muted">{d.body.length}/240</p>
            <Err msg={fe.body} />
          </div>
          <div className="flex items-start justify-between gap-4 rounded-xl bg-neutral-50 p-4">
            <div>
              <p className="text-sm font-semibold">Pedir el email</p>
              <p className="text-sm text-muted">El email se guarda en Clientes y se entrega el código de descuento.</p>
            </div>
            <Switch checked={d.collectEmail} onChange={(v) => set("collectEmail", v)} label="Pedir el email" />
            {d.collectEmail && <input type="hidden" name="collectEmail" value="on" />}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ctaLabel" className="mb-1.5 block text-sm font-semibold">
                Texto del botón
              </label>
              <input id="ctaLabel" name="ctaLabel" value={d.ctaLabel} onChange={(e) => set("ctaLabel", e.target.value)} required maxLength={40} className="field" />
              <Err msg={fe.ctaLabel} />
            </div>
            <div>
              <label htmlFor="discountCode" className="mb-1.5 block text-sm font-semibold">
                Código de descuento <span className="font-normal text-muted">(opcional)</span>
              </label>
              <input id="discountCode" name="discountCode" value={d.discountCode} onChange={(e) => set("discountCode", e.target.value.toUpperCase())} maxLength={24} className="field uppercase" placeholder="CROWN10" />
              <p className="mt-1.5 text-xs text-muted">Por ahora el código se le muestra al cliente, pero el checkout todavía no lo aplica automáticamente.</p>
              <Err msg={fe.discountCode} />
            </div>
          </div>
          {!d.collectEmail && (
            <div>
              <label htmlFor="ctaUrl" className="mb-1.5 block text-sm font-semibold">
                A dónde lleva el botón
              </label>
              <input id="ctaUrl" name="ctaUrl" value={d.ctaUrl} onChange={(e) => set("ctaUrl", e.target.value)} className="field" placeholder="/tienda?category=Buzos" />
              <Err msg={fe.ctaUrl} />
            </div>
          )}
          {d.collectEmail && <input type="hidden" name="ctaUrl" value="" />}
        </section>

        <section className="panel space-y-5 p-6">
          <h2 className="font-bold">Cuándo y a quién</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="audience" className="mb-1.5 block text-sm font-semibold">
                Mostrar a
              </label>
              <select id="audience" name="audience" value={d.audience} onChange={(e) => set("audience", e.target.value as PopupDraft["audience"])} className="field">
                {Object.entries(AUDIENCE_LABEL).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="trigger" className="mb-1.5 block text-sm font-semibold">
                Aparece
              </label>
              <select id="trigger" name="trigger" value={d.trigger} onChange={(e) => set("trigger", e.target.value as PopupDraft["trigger"])} className="field">
                {Object.entries(TRIGGER_LABEL).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {d.trigger === "delay" && (
            <div className="max-w-[12rem]">
              <label htmlFor="delaySeconds" className="mb-1.5 block text-sm font-semibold">
                Segundos de espera
              </label>
              <input id="delaySeconds" name="delaySeconds" type="number" min={0} max={300} value={d.delaySeconds} onChange={(e) => set("delaySeconds", e.target.value)} className="field" />
            </div>
          )}
          {d.trigger !== "delay" && <input type="hidden" name="delaySeconds" value={d.delaySeconds} />}
          {d.trigger === "exit" && <p className="text-sm text-muted">En celulares no existe &quot;intención de salida&quot;: el pop-up aparece a los 25 segundos.</p>}
          <p className="text-sm text-muted">Cada visitante ve el mismo pop-up una sola vez. Nunca aparece durante el checkout.</p>

          <div className="grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
            <div>
              <label htmlFor="startsAt" className="mb-1.5 block text-sm font-semibold">
                Desde <span className="font-normal text-muted">(opcional)</span>
              </label>
              <input id="startsAt" name="startsAt" type="date" value={d.startsAt} onChange={(e) => set("startsAt", e.target.value)} className="field" />
            </div>
            <div>
              <label htmlFor="endsAt" className="mb-1.5 block text-sm font-semibold">
                Hasta <span className="font-normal text-muted">(opcional)</span>
              </label>
              <input id="endsAt" name="endsAt" type="date" value={d.endsAt} onChange={(e) => set("endsAt", e.target.value)} className="field" />
              <Err msg={fe.endsAt} />
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-line pt-5">
            <div>
              <p className="text-sm font-semibold">Activo</p>
              <p className="text-sm text-muted">Si lo apagás queda guardado pero no se muestra.</p>
            </div>
            <Switch checked={d.active} onChange={(v) => set("active", v)} label="Pop-up activo" />
            {d.active && <input type="hidden" name="active" value="on" />}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={pending} className="btn btn-primary flex-1 py-3.5">
            {pending ? "Guardando…" : submitLabel}
          </button>
          <Link href="/admin/popups" className="btn btn-outline py-3.5">
            Cancelar
          </Link>
        </div>
      </div>

      <aside className="lg:sticky lg:top-8 lg:self-start" aria-label="Vista previa">
        <p className="mb-3 text-sm font-semibold">Vista previa</p>
        <div className="rounded-[32px] bg-neutral-200 p-5 sm:p-8">
          <PopupCard popup={{ title: d.title, body: d.body, ctaLabel: d.ctaLabel, ctaUrl: d.ctaUrl, collectEmail: d.collectEmail, discountCode: d.discountCode }} />
        </div>
        <p className="mt-3 text-sm text-muted">Así lo ven tus visitantes. Los campos no funcionan acá.</p>
      </aside>
    </form>
  );
}
