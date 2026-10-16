import "server-only";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import type { CheckoutInput, CheckoutResult, PaymentProvider } from "./types";

const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

function client() {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) throw new Error("Falta MP_ACCESS_TOKEN");
  return new MercadoPagoConfig({ accessToken, options: { timeout: 8000 } });
}

export const mercadoPago: PaymentProvider = {
  id: "mercadopago",

  isConfigured: () => Boolean(process.env.MP_ACCESS_TOKEN),

  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    const base = siteUrl();
    const items = input.items.map((it, i) => ({
      id: String(i + 1),
      title: it.title,
      quantity: it.quantity,
      unit_price: it.unitPrice,
      currency_id: "ARS",
    }));
    if (input.shippingCost > 0) {
      items.push({ id: "envio", title: "Envío", quantity: 1, unit_price: input.shippingCost, currency_id: "ARS" });
    }

    const back = `${base}/checkout/gracias?pedido=${input.orderNumber}`;
    const preference = await new Preference(client()).create({
      body: {
        items,
        payer: { email: input.payerEmail, name: input.payerName },
        external_reference: String(input.orderId),
        back_urls: { success: back, pending: back, failure: `${base}/checkout?pago=fallido` },
        // Mercado Pago solo acepta auto_return con URLs https (no en localhost).
        ...(base.startsWith("https://") ? { auto_return: "approved" } : {}),
        notification_url: `${base}/api/webhooks/mercadopago`,
        statement_descriptor: "CROWN",
      },
    });

    if (!preference.init_point) throw new Error("Mercado Pago no devolvió el link de pago");
    return { redirectUrl: preference.init_point, providerRef: preference.id };
  },
};

/** Consulta un pago ya hecho (lo usa el webhook para confirmar con Mercado Pago, sin fiarse del aviso). */
export async function fetchMercadoPagoPayment(paymentId: string) {
  const p = await new Payment(client()).get({ id: paymentId });
  return {
    id: String(p.id ?? paymentId),
    status: p.status ?? "unknown",
    externalReference: p.external_reference ?? null,
    amount: p.transaction_amount ?? 0,
  };
}
