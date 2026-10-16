"use client";

import { useTransition } from "react";
import { deleteProduct, setProductFeatured, setProductListed } from "@/app/actions/admin/products";
import { cn } from "@/lib/utils";

/** Interruptor accesible: role="switch". */
export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50", checked ? "bg-black" : "bg-neutral-300")}
    >
      <span className={cn("absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", checked && "translate-x-5")} />
    </button>
  );
}

export function ListedSwitch({ id, listed, name }: { id: number; listed: boolean; name: string }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center gap-2.5">
      <Switch
        checked={listed}
        disabled={pending}
        label={listed ? `Ocultar ${name} de la tienda` : `Mostrar ${name} en la tienda`}
        onChange={(next) => start(() => setProductListed(id, next))}
      />
      <span className="text-xs font-semibold text-muted">{listed ? "Visible" : "Oculto"}</span>
    </div>
  );
}

export function FeaturedButton({ id, featured, name }: { id: number; featured: boolean; name: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={featured}
      aria-label={`Destacar ${name} en el inicio`}
      onClick={() => start(() => setProductFeatured(id, !featured))}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50",
        featured ? "border-black bg-black text-white" : "border-line text-muted hover:border-black hover:text-black",
      )}
    >
      {featured ? "Destacado" : "Destacar"}
    </button>
  );
}

export function DeleteProductButton({ id, name, className }: { id: number; name: string; className?: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className={cn("btn btn-danger btn-sm", className)}
      onClick={() => {
        if (window.confirm(`¿Eliminar "${name}"?\n\nSe borra del catálogo y de la tienda. Los pedidos anteriores conservan sus datos. Esta acción no se puede deshacer.\n\nSi solo querés sacarlo de la tienda por un tiempo, ocultalo en su lugar.`)) {
          start(() => deleteProduct(id));
        }
      }}
    >
      {pending ? "Eliminando…" : "Eliminar"}
    </button>
  );
}
