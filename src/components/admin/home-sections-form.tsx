"use client";

import { useActionState, useState, useTransition } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { saveHomeSections, type HomeSectionsState } from "@/app/actions/admin/home";
import { HOME_SECTION_META, type HomeSectionConfig } from "@/lib/home-sections";
import { Switch } from "./product-row-actions";
import { cn } from "@/lib/utils";

export function HomeSectionsForm({ initial }: { initial: HomeSectionConfig[] }) {
  const [state, action, pending] = useActionState<HomeSectionsState, FormData>(saveHomeSections, {});
  const [, startTransition] = useTransition();
  const [sections, setSections] = useState(initial);

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= sections.length) return;
    setSections((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };
  const toggle = (index: number, enabled: boolean) =>
    setSections((prev) => prev.map((s, i) => (i === index ? { ...s, enabled } : s)));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData();
        fd.set("sections", JSON.stringify(sections));
        startTransition(() => action(fd));
      }}
      className="max-w-3xl space-y-6"
    >
      <ol className="space-y-3">
        {sections.map((s, i) => {
          const meta = HOME_SECTION_META[s.id];
          return (
            <li key={s.id} className={cn("panel flex items-center gap-4 p-4 sm:p-5", !s.enabled && "bg-neutral-50")}>
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-black/[0.06] text-sm font-bold" aria-hidden>
                {i + 1}
              </span>
              <div className={cn("min-w-0 flex-1", !s.enabled && "opacity-60")}>
                <h2 className="font-bold">{meta.label}</h2>
                <p className="mt-0.5 text-sm text-muted">{meta.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label={`Subir “${meta.label}”`}
                  className="grid size-9 place-items-center rounded-full hover:bg-black/[0.06] disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ArrowUp size={18} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === sections.length - 1}
                  aria-label={`Bajar “${meta.label}”`}
                  className="grid size-9 place-items-center rounded-full hover:bg-black/[0.06] disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ArrowDown size={18} aria-hidden />
                </button>
                <span className="ml-2">
                  <Switch checked={s.enabled} onChange={(v) => toggle(i, v)} label={`Mostrar “${meta.label}”`} />
                </span>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className="btn btn-primary px-8">
          {pending ? "Guardando…" : "Guardar cambios"}
        </button>
        {state.ok && (
          <p role="status" className="text-sm font-semibold text-emerald-800">
            Listo: la página de inicio ya se actualizó.
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
