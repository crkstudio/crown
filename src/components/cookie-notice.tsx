"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

export const COOKIE_CONSENT_KEY = "crown:cookies";
const CHANGE_EVENT = "crown:cookies-change";

type Consent = "accepted" | "declined" | null;

function read(): Consent {
  try {
    const v = localStorage.getItem(COOKIE_CONSENT_KEY);
    return v === "accepted" || v === "declined" ? v : null;
  } catch {
    return null;
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** Estado de consentimiento. Útil para habilitar analítica/marketing solo si es "accepted". */
export function useCookieConsent(): Consent | "unknown" {
  return useSyncExternalStore<Consent | "unknown">(subscribe, read, () => "unknown");
}

/**
 * Aviso de cookies / almacenamiento local.
 * Hoy el sitio solo usa almacenamiento local (carrito, pop-ups) y una cookie técnica del panel admin,
 * por eso el aviso es informativo. Cuando se agregue analítica, condicionarla a `useCookieConsent() === "accepted"`.
 */
export function CookieNotice() {
  const consent = useCookieConsent();
  const pathname = usePathname();
  const [persistFailed, setPersistFailed] = useState(false);

  const choose = useCallback((value: "accepted" | "declined") => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, value);
    } catch {
      setPersistFailed(true);
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  // Si el almacenamiento está bloqueado, ocultamos el aviso igual durante la sesión.
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    if (persistFailed) setDismissed(true);
  }, [persistFailed]);

  if (consent !== null || dismissed) return null;
  if (pathname.startsWith("/checkout")) return null;

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-xl sm:left-4 sm:right-auto sm:mx-0 pop-in"
    >
      <div className="glass rounded-2xl p-4 shadow-lg">
        <p className="text-sm leading-relaxed">
          Usamos almacenamiento local de tu navegador para recordar tu carrito y las promos que ya viste. No usamos
          cookies de seguimiento publicitario.{" "}
          <Link href="/legales/politica-de-privacidad" className="underline">
            Más info
          </Link>
          .
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary" onClick={() => choose("accepted")}>
            Aceptar
          </button>
          <button type="button" className="btn btn-outline" onClick={() => choose("declined")}>
            Solo necesarias
          </button>
        </div>
      </div>
    </div>
  );
}
