"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { CrownMark } from "./crown-logo";
import { cartCount, useCart, useHydrated } from "@/lib/cart";
import { cn } from "@/lib/utils";

const links = [
  { href: "/tienda", label: "Tienda" },
  { href: "/#nosotros", label: "Nosotros" },
];

/** La URL actual es un dato de petición: se lee dentro de un <Suspense> para no bloquear el prerenderizado. */
function ActiveNavLinks() {
  const pathname = usePathname();
  return <NavLinkList pathname={pathname} />;
}

function NavLinkList({ pathname }: { pathname: string | null }) {
  return (
    <ul className="flex items-center gap-0.5">
      {links.map((l) => {
        const active = l.href === "/tienda" && !!pathname?.startsWith("/tienda");
        return (
          <li key={l.href}>
            <Link
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm font-medium transition-colors hover:bg-black/[0.07] sm:px-4",
                active && "bg-black/[0.07]",
              )}
            >
              {l.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Barra flotante estilo "píldora" con efecto liquid glass. */
export function SiteNav() {
  const hydrated = useHydrated();
  const count = useCart((s) => cartCount(s.lines));
  const open = useCart((s) => s.open);
  const shown = hydrated ? count : 0;

  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-40 flex justify-center px-3 sm:top-4 sm:px-4">
      <nav
        aria-label="Principal"
        className="glass pointer-events-auto flex h-14 w-full max-w-[560px] items-center justify-between rounded-full pr-2 pl-5"
      >
        <Link href="/" aria-label="Crown, ir al inicio" className="flex items-center gap-2.5">
          <CrownMark className="h-[18px] w-auto" />
          <span className="display-md text-[15px] lowercase"></span>
        </Link>

        <Suspense fallback={<NavLinkList pathname={null} />}>
          <ActiveNavLinks />
        </Suspense>

        <button
          type="button"
          onClick={open}
          aria-label={shown ? `Abrir carrito, ${shown} ${shown === 1 ? "producto" : "productos"}` : "Abrir carrito"}
          className="relative grid h-10 w-10 place-items-center rounded-full bg-black text-white transition-transform active:scale-95"
        >
          <ShoppingBag size={18} strokeWidth={2} />
          {shown > 0 && (
            <span className="absolute -top-1 -right-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-white px-1 text-[11px] font-bold text-black ring-2 ring-black">
              {shown}
            </span>
          )}
        </button>
      </nav>
    </header>
  );
}
