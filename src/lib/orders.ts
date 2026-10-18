import "server-only";
import { and, eq, gte, inArray, max, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import type { OrderStatus } from "@/db/schema";
import type { StoreSettings } from "./queries";

const { products, variants, customers, orders, orderItems } = schema;

/** Error pensado para mostrarse tal cual al cliente. */
export class OrderError extends Error {}

export type NewOrderInput = {
  customer: { email: string; name: string; phone: string; marketing: boolean };
  shipping: { name: string; phone: string; address: string; city: string; province: string; zip: string; notes?: string };
  lines: { variantId: number; quantity: number }[];
  settings: Pick<StoreSettings, "shippingFlat" | "freeShippingFrom">;
};

/**
 * Crea el pedido y reserva el stock en una sola transacción:
 * si algo falla, no se descuenta nada. Los precios siempre se leen de la base,
 * nunca del navegador.
 */
export async function createOrder(input: NewOrderInput) {
  return db.transaction(async (tx) => {
    // Unificar líneas repetidas de la misma variante.
    const wanted = new Map<number, number>();
    for (const l of input.lines) wanted.set(l.variantId, (wanted.get(l.variantId) ?? 0) + l.quantity);

    const rows = await tx
      .select({ variant: variants, product: products })
      .from(variants)
      .innerJoin(products, eq(products.id, variants.productId))
      .where(inArray(variants.id, [...wanted.keys()]));

    const lines = [...wanted.entries()].map(([variantId, quantity]) => {
      const row = rows.find((r) => r.variant.id === variantId);
      if (!row || !row.product.listed) throw new OrderError("Uno de los productos de tu carrito ya no está disponible.");
      const label = `${row.product.name} (${row.variant.size} / ${row.variant.color})`;
      if (row.variant.stock < quantity) {
        throw new OrderError(
          row.variant.stock <= 0 ? `${label} se agotó.` : `De ${label} solo quedan ${row.variant.stock} unidades.`,
        );
      }
      return { ...row, quantity, label };
    });

    const subtotal = lines.reduce((n, l) => n + l.product.price * l.quantity, 0);
    const shippingCost = subtotal >= input.settings.freeShippingFrom ? 0 : input.settings.shippingFlat;
    const total = subtotal + shippingCost;

    const [customer] = await tx
      .insert(customers)
      .values({
        email: input.customer.email,
        name: input.customer.name,
        phone: input.customer.phone,
        source: "checkout",
        marketingOptIn: input.customer.marketing,
      })
      .onConflictDoUpdate({
        target: customers.email,
        set: {
          name: input.customer.name,
          phone: input.customer.phone,
          ...(input.customer.marketing ? { marketingOptIn: true } : {}),
        },
      })
      .returning();

    // Serializa la asignación del número de pedido entre transacciones concurrentes.
    await tx.execute(sql`select pg_advisory_xact_lock(1001)`);
    const [{ last }] = await tx.select({ last: max(orders.number) }).from(orders);
    const number = Math.max(last ?? 1000, 1000) + 1;

    const [order] = await tx
      .insert(orders)
      .values({
        number,
        customerId: customer.id,
        status: "pending",
        paymentProvider: "mercadopago",
        subtotal,
        shippingCost,
        total,
        shippingName: input.shipping.name,
        shippingPhone: input.shipping.phone,
        shippingAddress: input.shipping.address,
        shippingCity: input.shipping.city,
        shippingProvince: input.shipping.province,
        shippingZip: input.shipping.zip,
        notes: input.shipping.notes || null,
      })
      .returning();

    for (const l of lines) {
      await tx
        .insert(orderItems)
        .values({
          orderId: order.id,
          productId: l.product.id,
          variantId: l.variant.id,
          name: l.product.name,
          size: l.variant.size,
          color: l.variant.color,
          image: l.product.images[0] ?? null,
          unitPrice: l.product.price,
          quantity: l.quantity,
        });

      // El "gte" evita stock negativo si dos compras entran a la vez.
      const res = await tx
        .update(variants)
        .set({ stock: sql`${variants.stock} - ${l.quantity}` })
        .where(and(eq(variants.id, l.variant.id), gte(variants.stock, l.quantity)))
        .returning({ id: variants.id });
      if (res.length !== 1) throw new OrderError(`${l.label} se agotó justo ahora.`);
    }

    return {
      order,
      items: lines.map((l) => ({ title: `${l.product.name} · ${l.variant.size} / ${l.variant.color}`, quantity: l.quantity, unitPrice: l.product.price })),
    };
  });
}

/** Cancela un pedido y devuelve el stock reservado. No hace nada si ya estaba cancelado. */
export async function cancelOrderAndRestock(orderId: number) {
  return db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).for("update");
    if (!order || order.status === "cancelled") return false;

    const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    for (const it of items) {
      if (it.variantId == null) continue; // la variante fue eliminada
      await tx
        .update(variants)
        .set({ stock: sql`${variants.stock} + ${it.quantity}` })
        .where(eq(variants.id, it.variantId));
    }
    await tx.update(orders).set({ status: "cancelled" }).where(eq(orders.id, orderId));
    return true;
  });
}

/** Cambia el estado de un pedido. Un pedido cancelado no se puede reabrir (el stock ya volvió al inventario). */
export async function changeOrderStatus(orderId: number, status: OrderStatus) {
  if (status === "cancelled") return cancelOrderAndRestock(orderId);
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order) throw new OrderError("El pedido no existe.");
  if (order.status === "cancelled") throw new OrderError("Un pedido cancelado no se puede reabrir: el stock ya volvió al inventario.");
  await db.update(orders).set({ status }).where(eq(orders.id, orderId));
  return true;
}
