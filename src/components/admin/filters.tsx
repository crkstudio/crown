import Link from "next/link";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type Tab = { key: string; label: string; count?: number };

/** Pestañas de filtro que viajan en la URL (?filtro=...). */
export function FilterTabs({ base, param = "filtro", tabs, current, extra }: { base: string; param?: string; tabs: Tab[]; current: string; extra?: Record<string, string | undefined> }) {
  const href = (key: string) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(extra ?? {})) if (v) q.set(k, v);
    if (key !== tabs[0].key) q.set(param, key);
    const s = q.toString();
    return s ? `${base}?${s}` : base;
  };
  return (
    <nav aria-label="Filtros" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={href(t.key)}
          aria-current={t.key === current ? "page" : undefined}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors",
            t.key === current ? "border-black bg-black text-white" : "border-line bg-white hover:border-black",
          )}
        >
          {t.label}
          {t.count !== undefined && <span className={cn("ml-1.5", t.key === current ? "text-white/70" : "text-muted")}>{t.count}</span>}
        </Link>
      ))}
    </nav>
  );
}

/** Buscador por GET: no necesita JavaScript. Conserva los otros filtros con campos ocultos. */
export function SearchBox({ action, q, placeholder, hidden }: { action: string; q: string; placeholder: string; hidden?: Record<string, string | undefined> }) {
  return (
    <form action={action} role="search" className="relative w-full sm:w-72">
      {Object.entries(hidden ?? {}).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
      <label htmlFor="q" className="sr-only">
        Buscar
      </label>
      <Search size={16} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" aria-hidden />
      <input id="q" name="q" defaultValue={q} placeholder={placeholder} className="field rounded-full pl-10" />
    </form>
  );
}
