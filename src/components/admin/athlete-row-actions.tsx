"use client";

import { useTransition } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { deleteAthlete, moveAthlete, setAthleteVisible } from "@/app/actions/admin/athletes";
import { Switch } from "./product-row-actions";

export function AthleteVisibleSwitch({ id, visible, name }: { id: number; visible: boolean; name: string }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center gap-2.5">
      <Switch
        checked={visible}
        disabled={pending}
        label={visible ? `Ocultar a ${name}` : `Mostrar a ${name}`}
        onChange={(next) => start(() => setAthleteVisible(id, next))}
      />
      <span className="text-xs font-semibold text-muted">{visible ? "Visible" : "Oculto"}</span>
    </div>
  );
}

export function AthleteMoveButtons({ id, name, first, last }: { id: number; name: string; first: boolean; last: boolean }) {
  const [pending, start] = useTransition();
  const cls = "grid size-9 place-items-center rounded-full hover:bg-black/[0.06] disabled:opacity-30 disabled:hover:bg-transparent";
  return (
    <div className="flex items-center gap-1">
      <button type="button" className={cls} disabled={pending || first} aria-label={`Subir a ${name}`} onClick={() => start(() => moveAthlete(id, -1))}>
        <ArrowUp size={18} aria-hidden />
      </button>
      <button type="button" className={cls} disabled={pending || last} aria-label={`Bajar a ${name}`} onClick={() => start(() => moveAthlete(id, 1))}>
        <ArrowDown size={18} aria-hidden />
      </button>
    </div>
  );
}

export function DeleteAthleteButton({ id, name }: { id: number; name: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className="btn btn-danger btn-sm"
      onClick={() => {
        if (window.confirm(`¿Eliminar a "${name}"?\n\nSe saca de la tienda. Si solo querés ocultarlo por un tiempo, usá el interruptor “Visible”.`)) {
          start(() => deleteAthlete(id));
        }
      }}
    >
      {pending ? "Eliminando…" : "Eliminar"}
    </button>
  );
}