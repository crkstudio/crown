import { Suspense } from "react";
import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { getStoreSettings } from "@/lib/queries";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage(props: PageProps<"/checkout">) {
  return (
    <div className="mx-auto max-w-[1500px] px-5 pt-32 sm:px-10">
      <h1 className="display text-[clamp(2.6rem,8vw,6.5rem)]">Checkout</h1>
      <Suspense fallback={<div className="mt-12 h-96 animate-pulse rounded-3xl bg-surface" aria-hidden />}>
        <Form searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function Form({ searchParams }: Pick<PageProps<"/checkout">, "searchParams">) {
  const [settings, params] = await Promise.all([getStoreSettings(), searchParams]);
  return (
    <CheckoutForm
      storeOpen={settings.storeOpen}
      shippingFlat={settings.shippingFlat}
      freeShippingFrom={settings.freeShippingFrom}
      paymentFailed={params.pago === "fallido"}
    />
  );
}
