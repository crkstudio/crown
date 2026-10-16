import { createHmac, timingSafeEqual } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { fetchMercadoPagoPayment } from "@/lib/payments/mercadopago";

/**
 * Aviso de pago de Mercado Pago (IPN/Webhooks).
 * 1) Verifica la firma con MP_WEBHOOK_SECRET.
 * 2) Consulta el pago directo a Mercado Pago (no confía en el cuerpo del aviso).
 * 3) Si está aprobado y el monto coincide, marca el pedido como pagado (idempotente).
 */
export async function POST(request: Request) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret || !process.env.MP_ACCESS_TOKEN) {
    return new Response("Pagos no configurados", { status: 503 });
  }

  const url = new URL(request.url);
  let body: { type?: string; data?: { id?: string | number } } = {};
  try {
    body = await request.json();
  } catch {
    /* algunos avisos llegan solo con query params */
  }
  const dataId = String(url.searchParams.get("data.id") ?? body.data?.id ?? "");
  const type = url.searchParams.get("type") ?? body.type;

  // ── Firma: x-signature = "ts=...,v1=..."
  const signature = request.headers.get("x-signature") ?? "";
  const requestId = request.headers.get("x-request-id") ?? "";
  const parts = Object.fromEntries(signature.split(",").map((kv) => kv.trim().split("=", 2) as [string, string]));
  if (!parts.ts || !parts.v1 || !dataId) return new Response("Firma inválida", { status: 401 });

  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${parts.ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(parts.v1);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return new Response("Firma inválida", { status: 401 });

  if (type !== "payment") return new Response("ok");

  const payment = await fetchMercadoPagoPayment(dataId);
  const orderId = Number(payment.externalReference);
  if (!Number.isInteger(orderId)) return new Response("ok");

  const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, orderId)).limit(1);
  if (!order) return new Response("ok");

  if (payment.status === "approved") {
    if (payment.amount < order.total) {
      console.error(`[mp] monto distinto en pedido #${order.number}: pagó ${payment.amount}, esperado ${order.total}`);
      return new Response("ok");
    }
    await db
      .update(schema.orders)
      .set({ status: "paid", paymentProvider: "mercadopago", paymentId: payment.id })
      .where(and(eq(schema.orders.id, orderId), eq(schema.orders.status, "pending")));
  }
  return new Response("ok");
}
