import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CrownMark } from "@/components/crown-logo";
import { ProductCard } from "@/components/product-card";
import { getCategories, getFeaturedProducts } from "@/lib/queries";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Featured />
      <Categories />
      <About />
    </>
  );
}

function Hero() {
  return (
    <section className="flex h-svh min-h-[640px] flex-col px-5 pt-24 pb-8 sm:px-10">
      {/* El logo es la imagen: crece hasta donde da el alto de la pantalla y deja el mensaje siempre a la vista. */}
      <div className="hero-mark mx-auto flex min-h-0 w-full max-w-[1500px] flex-1 items-center justify-center py-4">
        <CrownMark className="h-full max-h-full w-auto max-w-full" preserveAspectRatio="xMidYMid meet" />
      </div>
      <div className="mx-auto grid w-full max-w-[1500px] gap-6 pt-4 md:grid-cols-[1fr_auto] md:items-end">
        <h1 className="display text-[clamp(1.9rem,4.4vw,4.2rem)]">
          <span className="block">Hecha para entrenar.</span>
          <span className="block">Hecha para durar.</span>
        </h1>
        <div className="flex items-center gap-3">
          <Link href="/tienda" className="btn btn-primary px-7 py-4">
            Ver la tienda
          </Link>
          <Link href="/#nosotros" className="btn btn-outline px-7 py-4">
            Conocé Crown
          </Link>
        </div>
      </div>
    </section>
  );
}

async function Featured() {
  const products = await getFeaturedProducts(4);
  return (
    <section className="mx-auto mt-24 max-w-[1500px] px-5 sm:px-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2 className="display-md text-3xl sm:text-5xl">Destacados</h2>
        <Link href="/tienda" className="flex items-center gap-1 font-semibold underline-offset-4 hover:underline">
          Ver todo <ArrowUpRight size={18} />
        </Link>
      </div>
      {products.length === 0 ? (
        <p className="rounded-2xl bg-surface p-10 text-center text-muted">Muy pronto vas a ver acá los primeros productos.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}

async function Categories() {
  const categories = await getCategories();
  if (categories.length === 0) return null;
  return (
    <section className="mx-auto mt-32 max-w-[1500px] px-5 sm:px-10" aria-labelledby="cats">
      <h2 id="cats" className="display-md mb-8 text-3xl sm:text-5xl">
        Comprá por categoría
      </h2>
      <ul className="border-b border-line">
        {categories.map((c) => (
          <li key={c.name}>
            <Link
              href={`/tienda?category=${encodeURIComponent(c.name)}`}
              className="group flex items-baseline justify-between gap-6 border-t border-line py-5 sm:py-7"
            >
              <span className="display text-[clamp(2.2rem,7vw,6rem)] transition-transform duration-300 group-hover:translate-x-3">{c.name}</span>
              <span className="text-sm whitespace-nowrap text-muted">
                {c.total} {c.total === 1 ? "producto" : "productos"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function About() {
  return (
    <section id="nosotros" className="mx-auto mt-32 max-w-[1500px] scroll-mt-28 px-5 sm:px-10">
      <div className="grid gap-10 md:grid-cols-2">
        <h2 className="display text-[clamp(2.4rem,6vw,5.5rem)]">Menos ruido. Más entrenamiento.</h2>
        <div className="max-w-xl space-y-5 text-lg leading-relaxed md:pt-3">
          <p>
            Crown es ropa deportiva con una idea simple: prendas limpias, cómodas y resistentes, sin logos gritones ni complicaciones.
          </p>
          <p className="text-muted">
            Diseñamos para que te olvides de la ropa y te concentres en lo que viniste a hacer.
          </p>
        </div>
      </div>
    </section>
  );
}
