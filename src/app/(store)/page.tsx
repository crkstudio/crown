import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import "@fontsource/libre-caslon-text/400.css";
import "@fontsource/pinyon-script/400.css";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { getAthletes, getCategories, getFeaturedProducts, getHomeSections, getStoreProducts } from "@/lib/queries";
import { JsonLd, organizationJsonLd } from "@/lib/json-ld";
import type { HomeSectionId } from "@/lib/home-sections";

/** A dónde baja la barra blanca de la portada: la primera sección visible que sigue. */
const NEXT_LINK: Partial<Record<HomeSectionId, { href: string; label: string }>> = {
  athletes: { href: "/#athletes", label: "conocé a los athletes" },
  featured: { href: "/#destacados", label: "ver destacados" },
  products: { href: "/#productos", label: "ver productos" },
  categories: { href: "/#categorias", label: "ver categorías" },
  about: { href: "/#nosotros", label: "conocé crown" },
};

export default async function HomePage() {
  // El orden y qué secciones se ven lo decide el panel de admin (Página de inicio).
  const visible = (await getHomeSections()).filter((s) => s.enabled).map((s) => s.id);
  const next = visible.find((id) => id !== "hero");

  return (
    // Si no hay portada, la barra flotante queda sobre la primera sección: se deja aire arriba.
    <div className={visible[0] === "hero" ? undefined : "pt-28"}>
      <JsonLd data={organizationJsonLd()} />
      {visible.map((id) => {
        switch (id) {
          case "hero":
            return <Hero key={id} next={next ? NEXT_LINK[next] : undefined} />;
          case "athletes":
            return <Athletes key={id} />;
          case "featured":
            return <Featured key={id} />;
          case "products":
            return <Products key={id} />;
          case "categories":
            return <Categories key={id} />;
          case "about":
            return <About key={id} />;
        }
      })}
    </div>
  );
}

function Hero({ next }: { next?: { href: string; label: string } }) {
  return (
    <section className="flex h-svh min-h-[600px] flex-col">
      {/* Foto a pantalla completa. El logo vive en la barra flotante, como en el ejemplo. */}
      <div className="relative flex-1 overflow-hidden bg-[#0d2410]">
        <Image src="/hero.jpg" alt="" fill priority sizes="100vw" className="object-cover object-center" />
        {/* Degradados: oscurecen la izquierda (texto) y el borde superior (barra flotante). */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/15 to-transparent" aria-hidden />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/35 to-transparent" aria-hidden />

        <div className="hero-mark relative flex h-full w-full flex-col justify-center px-5 pt-20 sm:pl-[10vw]">
          {/* "Athletes" se va descubriendo de izquierda a derecha, como escrito a mano. Los márgenes negativos evitan recortar los trazos que sobresalen de la caja. */}
          <style>{`
            @keyframes write-on {
              from { clip-path: inset(-25% 100% -25% -10%); }
              to   { clip-path: inset(-25% -10% -25% -10%); }
            }
            .write-on { animation: write-on 1.1s cubic-bezier(0.45, 0.05, 0.35, 1) 0.15s both; }
            @media (prefers-reduced-motion: reduce) { .write-on { animation: none; } }
          `}</style>
          {/* Tres tipografías, como en el ejemplo: sans en negrita, serif clásica y script caligráfica. */}
          <h1
            aria-label="crown style only for true Athletes"
            className="text-[clamp(2.2rem,4.1vw,4.6rem)] font-normal text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.25)]"
          >
            <span aria-hidden className="block leading-[1.05]">
              <span className="font-bold" style={{ fontFamily: '"Archivo Variable", sans-serif', fontStretch: "112%", letterSpacing: "-0.02em" }}>
                crown
              </span>{" "}
              <span style={{ fontFamily: '"Libre Caslon Text", Georgia, serif' }}>style</span>
            </span>
            <span aria-hidden className="block text-[0.78em] leading-[1.15]" style={{ fontFamily: '"Libre Caslon Text", Georgia, serif' }}>
              only for true
            </span>
            <span aria-hidden className="write-on -mt-[0.15em] block w-fit text-[2em] leading-[1.1]" style={{ fontFamily: '"Pinyon Script", cursive' }}>
              Athletes
            </span>
          </h1>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/tienda" className="btn bg-white px-7 py-4 text-black hover:bg-white/85">
              Ver la tienda
            </Link>
            <Link href="/#nosotros" className="btn border border-white px-7 py-4 text-white hover:bg-white hover:text-black">
              Conocé crown
            </Link>
          </div>
        </div>
      </div>

      {/* Barra blanca inferior, como el "find us." del ejemplo. */}
      {next && (
        <Link
          href={next.href}
          className="display-md flex h-16 shrink-0 items-center justify-center gap-2 bg-white text-lg lowercase transition-colors hover:bg-neutral-100"
        >
          {next.label} <ChevronDown size={22} strokeWidth={2.5} aria-hidden />
        </Link>
      )}
    </section>
  );
}

async function Athletes() {
  const list = (await getAthletes()).slice(0, 4);
  if (list.length === 0) return null;
  return (
    <section id="athletes" className="mx-auto mt-24 max-w-[1500px] scroll-mt-28 px-5 sm:px-10" aria-labelledby="athletes-title">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        <div className="flex flex-col justify-between gap-8 lg:py-4">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-muted uppercase">La comunidad crown</p>
            <h2
              id="athletes-title"
              className="mt-3 text-[clamp(4rem,9vw,8rem)] leading-[1.05] font-normal"
              style={{ fontFamily: '"Pinyon Script", cursive' }}
            >
              Athletes
            </h2>
            <p className="mt-4 max-w-sm text-lg leading-relaxed text-muted">
              Quienes entrenan con crown todos los días. Gente real, esfuerzo real.
            </p>
          </div>
          <Link href="/athletes" className="btn btn-outline w-fit">
            Conocer a los athletes <ArrowUpRight size={18} aria-hidden />
          </Link>
        </div>

        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {list.map((a) => (
            <li key={a.id}>
              <Link href="/athletes" className="group block">
                <div className="relative overflow-hidden rounded-2xl">
                  <ProductImage
                    src={a.image}
                    alt={a.name}
                    sizes="(min-width: 1280px) 18vw, (min-width: 640px) 30vw, 50vw"
                    className="aspect-[4/5] rounded-2xl transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <h3 className="mt-3 font-semibold">{a.name}</h3>
                <p className="text-sm text-muted">{a.sport}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
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

async function Products() {
  const products = await getStoreProducts(undefined, "nuevos", 8);
  return (
    <section id="productos" className="mx-auto mt-32 max-w-[1500px] scroll-mt-28 px-5 sm:px-10" aria-labelledby="productos-title">
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2 id="productos-title" className="display-md text-3xl sm:text-5xl">
          Productos
        </h2>
        <Link href="/tienda" className="flex items-center gap-1 font-semibold underline-offset-4 hover:underline">
          Ver toda la tienda <ArrowUpRight size={18} aria-hidden />
        </Link>
      </div>
      {products.length === 0 ? (
        <p className="rounded-2xl bg-surface p-10 text-center text-muted">Muy pronto vas a ver acá los primeros productos.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <Link href="/tienda" className="btn btn-outline px-8">
              Ver todos los productos
            </Link>
          </div>
        </>
      )}
    </section>
  );
}

async function Categories() {
  const categories = await getCategories();
  if (categories.length === 0) return null;
  return (
    <section id="categorias" className="mx-auto mt-32 max-w-[1500px] scroll-mt-28 px-5 sm:px-10" aria-labelledby="cats">
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2 id="cats" className="display-md text-3xl sm:text-5xl">
          Comprá por categoría
        </h2>
        <Link href="/tienda" className="flex items-center gap-1 font-semibold underline-offset-4 hover:underline">
          Ver todo <ArrowUpRight size={18} aria-hidden />
        </Link>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {categories.map((c, i) => (
          <li key={c.name}>
            <Link
              href={`/tienda?category=${encodeURIComponent(c.name)}`}
              className="group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-2xl bg-surface p-5 transition-colors duration-300 hover:bg-black hover:text-white sm:aspect-square sm:p-6"
            >
              <div className="flex items-start justify-between">
                <span className="text-sm font-semibold text-muted transition-colors group-hover:text-white/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="grid size-10 place-items-center rounded-full border border-line bg-white text-black transition-all duration-300 group-hover:rotate-45 group-hover:border-white">
                  <ArrowUpRight size={18} aria-hidden />
                </span>
              </div>
              <div>
                <span className="display block text-[clamp(1.6rem,3.2vw,2.8rem)] leading-none break-words">{c.name}</span>
                <span className="mt-2 block text-sm text-muted transition-colors group-hover:text-white/70">
                  {c.total} {c.total === 1 ? "producto" : "productos"}
                </span>
              </div>
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