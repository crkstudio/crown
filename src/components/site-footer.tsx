import Link from "next/link";
import { CrownMark } from "./crown-logo";
import { CONSUMER_COMPLAINT, LEGAL, LEGAL_LINKS, SOCIAL } from "@/lib/legal";

/* Lucide ya no incluye íconos de marcas: van como SVG propios (rellenos, toman el color del texto). */
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.6-3.1a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z"
      />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

const socialBtn = "inline-block transition-opacity hover:opacity-60";

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
              <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" className={socialBtn} aria-label="Instagram">
                <InstagramIcon />
              </a>
            </li>
            <li>
              <a href={SOCIAL.tiktok} target="_blank" rel="noopener noreferrer" className={socialBtn} aria-label="TikTok">
                <TikTokIcon />
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
