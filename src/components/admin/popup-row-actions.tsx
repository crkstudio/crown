"use client";

import { useTransition } from "react";
import { deletePopup, setPopupActive } from "@/app/actions/admin/popups";
import { Switch } from "./product-row-actions";

export function PopupActiveSwitch({ id, active, name }: { id: number; active: boolean; name: string }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center gap-2.5">
      <Switch checked={active} disabled={pending} label={active ? `Desactivar ${name}` : `Activar ${name}`} onChange={(next) => start(() => setPopupActive(id, next))} />
      <span className="text-xs font-semibold text-muted">{active ? "Activo" : "Apagado"}</span>
    </div>
  );
}

export function DeletePopupButton({ id, name }: { id: number; name: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className="btn btn-danger btn-sm"
      onClick={() => {
        if (window.confirm(`¿Eliminar el pop-up "${name}"? Se pierden también sus métricas.`)) start(() => deletePopup(id));
      }}
    >
      {pending ? "Eliminando…" : "Eliminar"}
    </button>
  );
}
