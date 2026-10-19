import Link from "next/link";
import { CrownMark } from "./crown-logo";
import { CONSUMER_COMPLAINT, LEGAL, LEGAL_LINKS } from "@/lib/legal";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-line">
      <div className="mx-auto grid max-w-[1500px] gap-12 px-5 py-14 sm:px-10 md:grid-cols-[1fr_auto]">
        <div>
          <CrownMark className="w-40 sm:w-56" />
          <p className="mt-6 max-w-sm text-muted">Ropa deportiva minimalista para entrenar en serio.</p>

          {/* Disp. 954/2025: enlace a simple vista, en lugar destacado y sin registro previo. */}
          <Link href="/arrepentimiento" className="btn btn-primary mt-8 px-8 py-4 text-base">
            Botón de arrepentimiento
          </Link>
          <p className="mt-3 max-w-sm text-sm text-muted">Revocá tu compra dentro de los {LEGAL.withdrawalDays} días corridos desde que la recibís.</p>
        </div>

        <nav aria-label="Pie de página" className="flex flex-wrap gap-x-16 gap-y-10 text-sm">
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
          <ul className="space-y-3">
            {LEGAL_LINKS.map((l) => (
              <li key={l.slug}>
                <Link href={`/legales/${l.slug}`} className="hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={CONSUMER_COMPLAINT.url} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">
                {CONSUMER_COMPLAINT.label}
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Datos del proveedor (Ley 24.240 art. 4 y Res. 270/2020). */}
      <div className="mx-auto max-w-[1500px] border-t border-line px-5 py-6 text-sm text-muted sm:px-10">
        <p>
          {LEGAL.legalName} · CUIT {LEGAL.cuit} · {LEGAL.address}
        </p>
        <p className="mt-1">
          Atención al consumidor: {LEGAL.email} · {LEGAL.phone} · {LEGAL.hours}
        </p>
      </div>
      <div className="mx-auto max-w-[1500px] px-5 pb-8 text-sm text-muted sm:px-10">© 2026 crown. Todos los derechos reservados. Precios finales en pesos argentinos con IVA incluido.</div>
    </footer>
  );
}
