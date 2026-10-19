import Link from "next/link";
import { CrownMark } from "./crown-logo";
import { CONSUMER_COMPLAINT, LEGAL, LEGAL_LINKS, SOCIAL } from "@/lib/legal";

/* Lucide ya no incluye íconos de marcas: van como SVG propios. */
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M15 3v11.5a4.5 4.5 0 1 1-4.5-4.5" />
      <path d="M15 3c.4 2.6 2.1 4.2 5 4.4" />
    </svg>
  );
}

const socialBtn = "inline-flex items-center gap-2.5 rounded-full border border-black px-4 py-2 font-semibold transition-colors hover:bg-black hover:text-white";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-line">
      <div className="mx-auto grid max-w-[1500px] gap-12 px-5 py-14 sm:px-10 md:grid-cols-[1fr_auto]">
        <div>
          <CrownMark className="w-40 sm:w-56" />
          <p className="mt-6 max-w-sm text-muted">Ropa deportiva minimalista para entrenar en serio.</p>
        </div>

        <nav aria-label="Pie de página" className="flex flex-wrap gap-x-16 gap-y-10 text-sm">
          <ul className="space-y-3" aria-label="Redes sociales">
            <li>
              <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" className={socialBtn}>
                <InstagramIcon /> Instagram
              </a>
            </li>
            <li>
              <a href={SOCIAL.tiktok} target="_blank" rel="noopener noreferrer" className={socialBtn}>
                <TikTokIcon /> TikTok
              </a>
            </li>
          </ul>
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
