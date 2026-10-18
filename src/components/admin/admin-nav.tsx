"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, ExternalLink, LayoutDashboard, LayoutTemplate, LogOut, Megaphone, Receipt, Settings, Shirt, Users } from "lucide-react";
import { CrownMark } from "@/components/crown-logo";
import { logout } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard, exact: true },
  { href: "/admin/ventas", label: "Ventas", icon: Receipt },
  { href: "/admin/productos", label: "Productos", icon: Shirt },
  { href: "/admin/stock", label: "Stock", icon: Boxes },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/popups", label: "Pop-ups", icon: Megaphone },
  { href: "/admin/inicio", label: "Página de inicio", icon: LayoutTemplate },
  { href: "/admin/ajustes", label: "Ajustes", icon: Settings },
];

function NavList({ pathname }: { pathname: string | null }) {
  return (
    <ul className="flex gap-1 lg:flex-col">
      {items.map(({ href, label, icon: Icon, exact }) => {
        const active = pathname ? (exact ? pathname === href : pathname.startsWith(href)) : false;
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors",
                active ? "bg-black text-white" : "text-black/70 hover:bg-black/[0.06] hover:text-black",
              )}
            >
              <Icon size={18} strokeWidth={2} aria-hidden />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function ActiveNavList() {
  return <NavList pathname={usePathname()} />;
}

export function AdminNav() {
  return (
    <aside className="border-b border-line bg-white lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-b-0">
      <div className="flex flex-col gap-3 p-4 lg:h-full lg:gap-8 lg:p-5">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5" aria-label="Crown admin, ir al resumen">
            <CrownMark className="h-5 w-auto" />
            <span className="display-md text-base lowercase">crown</span>
            <span className="rounded-full bg-black px-2 py-0.5 text-[10px] font-bold text-white">ADMIN</span>
          </Link>
          <form action={logout} className="lg:hidden">
            <button type="submit" className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/[0.06]" aria-label="Cerrar sesión">
              <LogOut size={18} />
            </button>
          </form>
        </div>

        <nav aria-label="Administración" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:flex-1 lg:overflow-visible lg:px-0">
          <Suspense fallback={<NavList pathname={null} />}>
            <ActiveNavList />
          </Suspense>
        </nav>

        <div className="hidden space-y-1 border-t border-line pt-4 lg:block">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-black/70 hover:bg-black/[0.06] hover:text-black"
          >
            <ExternalLink size={18} aria-hidden /> Ver la tienda
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-black/70 hover:bg-black/[0.06] hover:text-black"
            >
              <LogOut size={18} aria-hidden /> Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
