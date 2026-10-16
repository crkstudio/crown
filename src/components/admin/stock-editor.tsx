"use client";

import { useState, useTransition } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { setVariantStock } from "@/app/actions/admin/products";
import { cn } from "@/lib/utils";

/** Edita el stock de una variante. Guarda al salir del campo, con Enter o con los botones +/-. */
export function StockEditor({ variantId, stock, label, threshold }: { variantId: number; stock: number; label: string; threshold: number }) {
  const [saved, setSaved] = useState(stock);
  const [value, setValue] = useState(String(stock));
  const [error, setError] = useState("");
  const [justSaved, setJustSaved] = useState(false);
  const [pending, start] = useTransition();

  function commit(raw: string) {
    const n = Number(raw);
    if (raw.trim() === "" || !Number.isInteger(n) || n < 0) {
      setError("Ingresá un número entero, 0 o más.");
      setValue(String(saved));
      return;
    }
    setError("");
    if (n === saved) return;
    const previous = saved;
    setSaved(n);
    setValue(String(n));
    start(async () => {
      const res = await setVariantStock(variantId, n);
      if ("error" in res && res.error) {
        setSaved(previous);
        setValue(String(previous));
        setError(res.error);
      } else {
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 1400);
      }
    });
  }

  const step = (d: number) => commit(String(Math.max(0, saved + d)));
  const tone = saved <= 0 ? "border-rose-300 bg-rose-50" : saved <= threshold ? "border-amber-300 bg-amber-50" : "";

  return (
    <div>
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={() => step(-1)} disabled={pending || saved <= 0} aria-label={`Restar una unidad a ${label}`} className="grid h-9 w-9 place-items-center rounded-full border border-line hover:bg-neutral-100 disabled:opacity-30">
          <Minus size={15} />
        </button>
        <input
          aria-label={`Stock de ${label}`}
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.currentTarget.blur(), e.preventDefault())}
          className={cn("field !w-[4.5rem] !px-2 !py-1.5 text-center font-bold", tone)}
        />
        <button type="button" onClick={() => step(1)} disabled={pending} aria-label={`Sumar una unidad a ${label}`} className="grid h-9 w-9 place-items-center rounded-full border border-line hover:bg-neutral-100 disabled:opacity-30">
          <Plus size={15} />
        </button>
        <span className="w-5" aria-live="polite">
          {justSaved && <Check size={16} className="text-emerald-700" aria-label="Guardado" />}
        </span>
      </div>
      {error && (
        <p role="alert" className="mt-1 text-xs font-medium text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}
