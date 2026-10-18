import type { Metadata } from "next";
import { ProductImage } from "@/components/product-image";
import { getAthletes } from "@/lib/queries";
import "@fontsource/pinyon-script/400.css";

export const metadata: Metadata = {
  title: "Athletes",
  description: "Las personas que entrenan con crown.",
};

export default async function AthletesPage() {
  const athletes = await getAthletes();
  return (
    <div className="mx-auto max-w-[1500px] px-5 pt-32 sm:px-10">
      <h1 className="text-[clamp(4rem,12vw,10rem)] leading-[1.1] font-normal" style={{ fontFamily: '"Pinyon Script", cursive' }}>
        Athletes
      </h1>
      <p className="mt-2 max-w-xl text-lg text-muted">Las personas que entrenan con crown.</p>

      {athletes.length === 0 ? (
        <p className="mt-12 rounded-2xl bg-surface p-10 text-center text-muted">Muy pronto vas a conocer a los athletes de crown.</p>
      ) : (
        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {athletes.map((a, i) => (
            <li key={a.id}>
              <article>
                <ProductImage
                  src={a.image}
                  alt={a.image ? a.name : ""}
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  priority={i < 4}
                  className="aspect-[4/5] rounded-2xl"
                />
                <h2 className="mt-3 font-semibold leading-snug">{a.name}</h2>
                <p className="text-sm text-muted">{a.sport}</p>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}