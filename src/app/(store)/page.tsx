import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import "@fontsource/libre-caslon-text/400.css";
import "@fontsource/pinyon-script/400.css";
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
    <section className="flex h-svh min-h-[600px] flex-col">
      {/* Foto a pantalla completa. El logo vive en la barra flotante, como en el ejemplo. */}
      <div className="relative flex-1 overflow-hidden bg-[#0d2410]">
        <Image src="/hero.jpg" alt="" fill priority sizes="100vw" className="object-cover object-center" />
        {/* Degradados: oscurecen la izquierda (texto) y el borde superior (barra flotante). */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/15 to-transparent" aria-hidden />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/35 to-transparent" aria-hidden />

        <div className="hero-mark relative flex h-full w-full flex-col justify-center px-5 pt-20 sm:pl-[10vw]">
          {/* Tres tipografías, como en el ejemplo: sans en negrita, serif clásica y script caligráfica. */}
          <h1
            aria-label="crowe style only for true Athletes"
            className="text-[clamp(2.2rem,4.1vw,4.6rem)] font-normal text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.25)]"
          >
            <span aria-hidden className="block leading-[1.05]">
              <span className="font-bold" style={{ fontFamily: '"Archivo Variable", sans-serif', fontStretch: "112%", letterSpacing: "-0.02em" }}>
                crowe
              </span>{" "}
              <span style={{ fontFamily: '"Libre Caslon Text", Georgia, serif' }}>style</span>
            </span>
            <span aria-hidden className="block text-[0.78em] leading-[1.15]" style={{ fontFamily: '"Libre Caslon Text", Georgia, serif' }}>
              only for true
            </span>
            <span aria-hidden className="-mt-[0.15em] block text-[2em] leading-[1.1]" style={{ fontFamily: '"Pinyon Script", cursive' }}>
              Athletes
            </span>
          </h1>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/tienda" className="btn bg-white px-7 py-4 text-black hover:bg-white/85">
              Ver la tienda
            </Link>
            <Link href="/#nosotros" className="btn border border-white px-7 py-4 text-white hover:bg-white hover:text-black">
              Conocé Crown
            </Link>
          </div>
        </div>
      </div>

      {/* Barra blanca inferior, como el "find us." del ejemplo. */}
      <Link
        href="/#destacados"
        className="display-md flex h-16 shrink-0 items-center justify-center gap-2 bg-white text-lg lowercase transition-colors hover:bg-neutral-100"
      >
        ver destacados <ChevronDown size={22} strokeWidth={2.5} aria-hidden />
      </Link>
    </section>
  );
}

async function Featured() {
  const products = await getFeaturedProducts(4);
  return (
    <section id="destacados" className="mx-auto mt-24 max-w-[1500px] scroll-mt-28 px-5 sm:px-10">
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