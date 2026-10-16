import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { connection } from "next/server";
import { db, schema } from "@/db";
import { ClearCart } from "@/components/clear-cart";
import { CrownMark } from "@/components/crown-logo";

export const metadata: Metadata = { title: "Gracias por tu compra", robots: { index: false } };

export default function ThanksPage(props: PageProps<"/checkout/gracias">) {
  return (
    <div className="mx-auto max-w-[900px] px-5 pt-40 text-center sm:px-10">
      <Suspense fallback={<div className="mx-auto h-64 max-w-md animate-pulse rounded-3xl bg-surface" aria-hidden />}>
        <Content searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function Content({ searchParams }: Pick<PageProps<"/checkout/gracias">, "searchParams">) {
  await connection();
  const params = await searchParams;
  const number = Number(params.pedido);
  const order = Number.isInteger(number)
    ? db.select({ status: schema.orders.status }).from(schema.orders).where(eq(schema.orders.number, number)).get()
    : undefined;

  const confirmed = order && order.status !== "pending";

  return (
    <>
      {order && <ClearCart />}
      <CrownMark className="mx-auto w-28" />
      <h1 className="display mt-10 text-[clamp(2.4rem,7vw,5rem)]">{order ? "Gracias por tu compra" : "No encontramos ese pedido"}</h1>
      {order ? (
        <>
          <p className="mt-6 text-lg">
            Pedido <strong>#{number}</strong>
          </p>
          <p className="mx-auto mt-3 max-w-md text-muted">
            {confirmed
              ? "Tu pago está confirmado. Estamos preparando tu envío."
              : "Estamos esperando la confirmación del pago. Guardá tu número de pedido."}
          </p>
        </>
      ) : (
        <p className="mx-auto mt-6 max-w-md text-muted">Revisá el link o volvé a la tienda.</p>
      )}
      <Link href="/tienda" className="btn btn-primary mt-10">
        Seguir comprando
      </Link>
    </>
  );
}
