"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { PopupCard } from "./popup-card";
import { subscribeFromPopup, trackPopupClick, trackPopupView } from "@/app/actions/popups";
import type { PublicPopup } from "@/lib/queries";

const seenKey = (id: number) => `crown:popup:${id}`;

/**
 * Decide si hay que mostrar un pop-up comercial y cuándo.
 * - "Visitantes nuevos": solo en la primera visita del navegador.
 * - Cada pop-up se muestra una sola vez por navegador.
 * - No aparece durante el checkout.
 */
export function WelcomePopup({ popups }: { popups: PublicPopup[] }) {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<PublicPopup | null>(null);
  const blocked = pathname.startsWith("/checkout");

  useEffect(() => {
    if (blocked || active || popups.length === 0) return;

    // Contamos visitas (una por sesión del navegador).
    let visits = 1;
    try {
      visits = Number(localStorage.getItem("crown:visits") ?? 0);
      if (!sessionStorage.getItem("crown:session")) {
        visits += 1;
        localStorage.setItem("crown:visits", String(visits));
        sessionStorage.setItem("crown:session", "1");
      }
    } catch {
      /* almacenamiento bloqueado: tratamos la visita como nueva */
    }

    const now = Date.now();
    const candidate = popups.find((p) => {
      if (p.startsAt && now < p.startsAt) return false;
      if (p.endsAt && now > p.endsAt) return false;
      if (p.audience === "new" && visits > 1) return false;
      try {
        if (localStorage.getItem(seenKey(p.id))) return false;
      } catch {
        /* ignorar */
      }
      return true;
    });
    if (!candidate) return;

    const show = () => {
      try {
        localStorage.setItem(seenKey(candidate.id), "1");
      } catch {
        /* ignorar */
      }
      setActive(candidate);
      void trackPopupView(candidate.id);
    };

    const touchOnly = window.matchMedia("(hover: none)").matches;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cleanup: (() => void) | undefined;

    if (candidate.trigger === "load") {
      timer = setTimeout(show, 600);
    } else if (candidate.trigger === "delay" || touchOnly) {
      // En pantallas táctiles no existe "intención de salida": usamos una espera.
      const secs = candidate.trigger === "exit" ? 25 : Math.max(1, candidate.delaySeconds);
      timer = setTimeout(show, secs * 1000);
    } else {
      const onLeave = (e: MouseEvent) => {
        if (e.clientY <= 0) show();
      };
      document.addEventListener("mouseleave", onLeave);
      cleanup = () => document.removeEventListener("mouseleave", onLeave);
    }

    return () => {
      if (timer) clearTimeout(timer);
      cleanup?.();
    };
  }, [popups, blocked, active]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (active && !d.open) d.showModal();
    if (!active && d.open) d.close();
  }, [active]);

  const close = () => setActive(null);

  if (!active) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      aria-label={active.title}
      className="fixed inset-0 m-0 grid h-dvh max-h-none w-full max-w-none place-items-center bg-transparent p-4 backdrop:bg-black/35 backdrop:backdrop-blur-[3px]"
    >
      <div className="w-full max-w-[460px] animate-[pop-in_0.4s_cubic-bezier(0.2,0.8,0.2,1)]">
        <PopupCard
          popup={active}
          onClose={close}
          onSubmitEmail={(email) => subscribeFromPopup(active.id, email)}
          onCtaClick={() => void trackPopupClick(active.id)}
        />
      </div>
    </dialog>
  );
}
