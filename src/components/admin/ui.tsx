import type { ReactNode } from "react";
import type { OrderStatus } from "@/db/schema";
import { ORDER_STATUS_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="display-md text-3xl sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, hint, tone }: { label: string; value: ReactNode; hint?: string; tone?: "warn" }) {
  return (
    <div className="panel p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className={cn("mt-2 text-3xl font-bold tracking-tight", tone === "warn" && "text-rose-700")}>{value}</p>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
    </div>
  );
}

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-900",
  paid: "bg-emerald-100 text-emerald-900",
  shipped: "bg-sky-100 text-sky-900",
  delivered: "bg-neutral-200 text-neutral-800",
  cancelled: "bg-rose-100 text-rose-900",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("inline-block rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap", STATUS_STYLE[status])}>
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "good" | "warn" | "bad" | "dark" }) {
  const tones = {
    neutral: "bg-neutral-100 text-neutral-700",
    good: "bg-emerald-100 text-emerald-900",
    warn: "bg-amber-100 text-amber-900",
    bad: "bg-rose-100 text-rose-900",
    dark: "bg-black text-white",
  };
  return <span className={cn("inline-block rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap", tones[tone])}>{children}</span>;
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="panel px-6 py-16 text-center">
      <p className="text-lg font-semibold">{title}</p>
      {children && <div className="mt-4 flex justify-center">{children}</div>}
    </div>
  );
}

/** Contenedor de tabla con scroll horizontal en pantallas chicas. */
export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export const th = "px-4 py-3 text-left text-xs font-semibold text-muted whitespace-nowrap";
export const td = "px-4 py-3.5 align-middle";
export const trow = "border-t border-line transition-colors hover:bg-neutral-50";

export function PanelSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-hidden>
      <div className="h-10 w-64 rounded-xl bg-surface" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-surface" />
        ))}
      </div>
      <div className="h-80 rounded-2xl bg-surface" />
    </div>
  );
}
