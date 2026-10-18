import { createHmac, timingSafeEqual } from "node:crypto";
import { confirmMercadoPagoPayment } from "@/lib/payments/confirm";

/**
 * Aviso de pago de Mercado Pago (Webhooks).
 * 1) Verifica la firma con MP_WEBHOOK_SECRET.
 * 2) Consulta el pago directo a Mercado Pago (no confía en el cuerpo del aviso).
 * 3) Si está aprobado y el monto coincide, marca el pedido como pagado (idempotente).
 */
export async function POST(request: Request) {
  const secret = process.env.MP_WEBHOOK_SECRET?.trim();
  if (!secret || !process.env.MP_ACCESS_TOKEN) {
    console.error("[mp] webhook: faltan MP_WEBHOOK_SECRET o MP_ACCESS_TOKEN", {
      hasSecret: !!secret,
      hasToken: !!process.env.MP_ACCESS_TOKEN,
    });
    return new Response("Pagos no configurados", { status: 503 });
  }

  const url = new URL(request.url);
  let body: { type?: string; action?: string; data?: { id?: string | number } } = {};
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
  const parts: Record<string, string> = {};
  for (const kv of signature.split(",")) {
    const i = kv.indexOf("=");
    if (i > 0) parts[kv.slice(0, i).trim()] = kv.slice(i + 1).trim();
  }

  if (!parts.ts || !parts.v1 || !dataId) {
    console.error("[mp] firma inválida: faltan datos", {
      hasSignatureHeader: !!signature,
      hasTs: !!parts.ts,
      hasV1: !!parts.v1,
      dataId,
      queryDataId: url.searchParams.get("data.id"),
      bodyDataId: body.data?.id,
    });
    return new Response("Firma inválida", { status: 401 });
  }

  // El manifest solo incluye los campos que llegaron.
  let manifest = `id:${dataId.toLowerCase()};`;
  if (requestId) manifest += `request-id:${requestId};`;
  manifest += `ts:${parts.ts};`;

  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(parts.v1);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    console.error("[mp] firma inválida: no coincide (casi seguro MP_WEBHOOK_SECRET incorrecta)", {
      dataId,
      requestId,
      ts: parts.ts,
      secretLength: secret.length,
      receivedV1Prefix: parts.v1.slice(0, 8),
      expectedPrefix: expected.slice(0, 8),
    });
    return new Response("Firma inválida", { status: 401 });
  }

  if (type !== "payment") return new Response("ok");

  try {
    await confirmMercadoPagoPayment(dataId);
  } catch (e) {
    console.error("[mp] webhook: error al confirmar el pago", e);
    return new Response("error", { status: 500 }); // MP reintenta
  }
  return new Response("ok");
}