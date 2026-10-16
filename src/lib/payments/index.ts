import "server-only";
import { mercadoPago } from "./mercadopago";
import type { PaymentProvider } from "./types";

/** Para sumar otra pasarela (Stripe, Ualá…) alcanza con implementar PaymentProvider y registrarla acá. */
const providers: Record<string, PaymentProvider> = { mercadopago: mercadoPago };

export function getPaymentProvider(): PaymentProvider {
  const id = process.env.PAYMENT_PROVIDER ?? "mercadopago";
  return providers[id] ?? mercadoPago;
}
