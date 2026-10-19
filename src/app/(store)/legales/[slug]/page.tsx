import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import { getLegalDoc, LEGAL_DOCS } from "@/lib/legal-content";
import { CONSUMER_COMPLAINT, LEGAL, LEGAL_LINKS } from "@/lib/legal";

export function generateStaticParams() {
  return LEGAL_DOCS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/legales/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const doc = getLegalDoc(slug);
  if (!doc) return { title: "Página no encontrada" };
  return { title: doc.title, description: doc.description };
}

export default function LegalPage(props: PageProps<"/legales/[slug]">) {
  return (
    <div className="mx-auto max-w-[900px] px-5 pt-28 sm:px-10">
      <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold hover:underline">
        <ChevronLeft size={16} /> Volver al inicio
      </Link>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-surface" aria-hidden />}>
        <LegalView params={props.params} />
      </Suspense>
    </div>
  );
}

async function LegalView({ params }: Pick<PageProps<"/legales/[slug]">, "params">) {
  const { slug } = await params;
  const doc = getLegalDoc(slug);
  if (!doc) notFound();

  return (
    <article>
      <h1 className="display text-[clamp(2.2rem,6vw,4rem)]">{doc.title}</h1>
      <p className="mt-3 text-sm text-muted">Última actualización: {LEGAL.updatedAt}</p>

      <div className="mt-10 space-y-10">
        {doc.sections.map((s) => (
          <section key={s.title}>
            <h2 className="display-md text-xl sm:text-2xl">{s.title}</h2>
            {s.paragraphs?.map((p) => (
              <p key={p} className="mt-3 leading-relaxed text-black/80">
                {p}
              </p>
            ))}
            {s.list && (
              <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-black/80">
                {s.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <nav aria-label="Otras páginas legales" className="mt-16 border-t border-line pt-8 text-sm">
        <ul className="flex flex-wrap gap-x-8 gap-y-3">
          {LEGAL_LINKS.filter((l) => l.slug !== doc.slug).map((l) => (
            <li key={l.slug}>
              <Link href={`/legales/${l.slug}`} className="font-semibold hover:underline">
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
    </article>
  );
}
