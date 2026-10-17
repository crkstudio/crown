import Link from "next/link";
import { CrownMark } from "./crown-logo";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-line">
      <div className="mx-auto grid max-w-[1500px] gap-12 px-5 py-14 sm:px-10 md:grid-cols-[1fr_auto]">
        <div>
          <CrownMark className="w-40 sm:w-56" />
          <p className="mt-6 max-w-sm text-muted">Ropa deportiva minimalista para entrenar en serio.</p>
        </div>
        <nav aria-label="Pie de página" className="flex gap-16 text-sm">
          <ul className="space-y-3">
            <li>
              <Link href="/tienda" className="hover:underline">
                Tienda
              </Link>
            </li>
            <li>
              <Link href="/#nosotros" className="hover:underline">
                Nosotros
              </Link>
            </li>
            <li>
              <Link href="/checkout" className="hover:underline">
                Checkout
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="mx-auto max-w-[1500px] px-5 pb-8 text-sm text-muted sm:px-10">© 2026 crown. Todos los derechos reservados.</div>
    </footer>
  );
}
