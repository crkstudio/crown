import "server-only";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { fetchMercadoPagoPayment } from "./mercadopago";

/** Consulta el pago a Mercado Pago y, si está aprobado y el monto cierra, marca el pedido como pagado (idempotente). */
export async function confirmMercadoPagoPayment(paymentId: string) {
  const payment = await fetchMercadoPagoPayment(paymentId);
  const orderId = Number(payment.externalReference);
  if (!Number.isInteger(orderId)) {
    console.error(`[mp] pago ${paymentId} sin external_reference válido:`, payment.externalReference);
    return "ignored" as const;
  }

  const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, orderId)).limit(1);
  if (!order) {
    console.error(`[mp] pago ${paymentId}: no existe el pedido ${orderId}`);
    return "ignored" as const;
  }

  if (payment.status !== "approved") {
    console.log(`[mp] pago ${paymentId} del pedido #${order.number} está "${payment.status}"`);
    return "not-approved" as const;
  }
  if (payment.amount < order.total) {
    console.error(`[mp] monto distinto en pedido #${order.number}: pagó ${payment.amount}, esperado ${order.total}`);
    return "ignored" as const;
  }

  await db
    .update(schema.orders)
    .set({ status: "paid", paymentProvider: "mercadopago", paymentId: payment.id })
    .where(and(eq(schema.orders.id, orderId), eq(schema.orders.status, "pending")));
  console.log(`[mp] pedido #${order.number} marcado como pagado`);
  return "paid" as const;
}