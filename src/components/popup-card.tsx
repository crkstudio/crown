"use client";

import { useState } from "react";
import { Check, Copy, X } from "lucide-react";
import { CrownMark } from "./crown-logo";

export type PopupContent = {
  title: string;
  body: string;
  ctaLabel: string;
  ctaUrl?: string | null;
  collectEmail: boolean;
  discountCode?: string | null;
};

type Result = { ok: true; code: string | null } | { ok: false; error: string };

/**
 * Tarjeta del pop-up. La usa la tienda (con acciones reales)
 * y la vista previa del panel admin (sin acciones).
 */
export function PopupCard({
  popup,
  onClose,
  onSubmitEmail,
  onCtaClick,
}: {
  popup: PopupContent;
  onClose?: () => void;
  onSubmitEmail?: (email: string) => Promise<Result>;
  onCtaClick?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!onSubmitEmail) return;
    setStatus("loading");
    setError("");
    const res = await onSubmitEmail(email);
    if (res.ok) {
      setCode(res.code);
      setStatus("done");
    } else {
      setError(res.error);
      setStatus("idle");
    }
  }

  async function copy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* sin portapapeles: el código queda visible igual */
    }
  }

  return (
    <div className="relative w-full overflow-hidden rounded-[28px] bg-white p-7 shadow-2xl sm:p-9">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 grid h-9 w-9 place-items-center rounded-full bg-surface transition-colors hover:bg-black hover:text-white"
        >
          <X size={16} />
        </button>
      )}
      <CrownMark className="mb-6 h-7 w-auto" />

      {status === "done" ? (
        <div role="status">
          <h2 className="display-md text-[1.7rem]">{code ? "Listo, este es tu código" : "Listo, ya estás en la lista"}</h2>
          {code ? (
            <>
              <button
                type="button"
                onClick={copy}
                className="mt-5 flex w-full items-center justify-between rounded-2xl border border-dashed border-black/40 px-5 py-4 text-left"
              >
                <span className="display-md text-2xl tracking-widest">{code}</span>
                <span className="flex items-center gap-1.5 text-sm font-semibold">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "Copiado" : "Copiar"}
                </span>
              </button>
              <p className="mt-3 text-sm text-muted">Usalo en tu próxima compra.</p>
            </>
          ) : (
            <p className="mt-3 text-muted">Te avisamos cuando haya novedades.</p>
          )}
          {onClose && (
            <button type="button" onClick={onClose} className="btn btn-primary mt-6 w-full">
              Seguir mirando
            </button>
          )}
        </div>
      ) : (
        <>
          <h2 className="display-md max-w-[16ch] text-[1.9rem] sm:text-[2.2rem]">{popup.title || "Título del pop-up"}</h2>
          {popup.body && <p className="mt-3 text-muted">{popup.body}</p>}

          {popup.collectEmail ? (
            onSubmitEmail ? (
              <form onSubmit={submit} className="mt-6 space-y-3" noValidate>
                <label className="sr-only" htmlFor="popup-email">
                  Tu email
                </label>
                <input
                  id="popup-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="field"
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "popup-error" : undefined}
                />
                {error && (
                  <p id="popup-error" role="alert" className="text-sm font-medium text-rose-700">
                    {error}
                  </p>
                )}
                <button type="submit" disabled={status === "loading"} className="btn btn-primary w-full py-3.5">
                  {status === "loading" ? "Enviando…" : popup.ctaLabel || "Enviar"}
                </button>
              </form>
            ) : (
              // Vista previa del panel: solo dibujo. No puede ser un <form> porque vive dentro del formulario de edición.
              <div className="pointer-events-none mt-6 space-y-3 select-none" aria-hidden>
                <div className="field text-[#9a9a9a]">tu@email.com</div>
                <div className="btn btn-primary w-full py-3.5">{popup.ctaLabel || "Enviar"}</div>
              </div>
            )
          ) : popup.ctaUrl ? (
            <a href={popup.ctaUrl} onClick={onCtaClick} className="btn btn-primary mt-6 w-full py-3.5">
              {popup.ctaLabel || "Ver más"}
            </a>
          ) : null}

          {onClose && (
            <button type="button" onClick={onClose} className="mt-4 w-full text-center text-sm text-muted hover:text-black">
              No, gracias
            </button>
          )}
        </>
      )}
    </div>
  );
}
