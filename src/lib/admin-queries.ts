import "server-only";
import { and, asc, count, desc, eq, gte, ilike, inArray, lte, or, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import type { OrderStatus } from "@/db/schema";
import { requireAdmin } from "./auth";
import { readHomeSections, readSettings } from "./queries";
import { REVENUE_STATUSES } from "./labels";

const { products, variants, customers, orders, orderItems, popups, athletes } = schema;

/* ───────────── Resumen ───────────── */

export async function getDashboard() {
  await requireAdmin();
  const settings = await readSettings();
  const since = new Date(Date.now() - 30 * 86400_000);
  const since14 = new Date(Date.now() - 14 * 86400_000);

  // Las 9 consultas salen a la vez (el pool de conexiones las reparte) en vez de una detrás de otra.
  const [[rev], [pending], [toShip], [newCustomers], [totalCustomers], lowStock, [lowCount], recent, days14] = await Promise.all([
    db
      .select({ total: sql<number>`coalesce(sum(${orders.total}), 0)::int`, n: count() })
      .from(orders)
      .where(and(inArray(orders.status, REVENUE_STATUSES), gte(orders.createdAt, since))),
    db.select({ n: count() }).from(orders).where(eq(orders.status, "pending")),
    db.select({ n: count() }).from(orders).where(eq(orders.status, "paid")),
    db.select({ n: count() }).from(customers).where(gte(customers.createdAt, since)),
    db.select({ n: count() }).from(customers),
    db
      .select({
        variantId: variants.id,
        productId: products.id,
        name: products.name,
        size: variants.size,
        color: variants.color,
        stock: variants.stock,
      })
      .from(variants)
      .innerJoin(products, eq(products.id, variants.productId))
      .where(lte(variants.stock, settings.lowStockThreshold))
      .orderBy(asc(variants.stock), asc(products.name))
      .limit(8),
    db.select({ n: count() }).from(variants).where(lte(variants.stock, settings.lowStockThreshold)),
    db
      .select({
        id: orders.id,
        number: orders.number,
        total: orders.total,
        status: orders.status,
        createdAt: orders.createdAt,
        customer: orders.shippingName,
      })
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(6),
    // Ingresos por día de los últimos 14 días (hora Argentina)
    db
      .select({
        day: sql<string>`to_char(${orders.createdAt} at time zone 'America/Argentina/Buenos_Aires', 'YYYY-MM-DD')`,
        total: sql<number>`coalesce(sum(${orders.total}), 0)::int`,
      })
      .from(orders)
      .where(and(inArray(orders.status, REVENUE_STATUSES), gte(orders.createdAt, since14)))
      .groupBy(sql`1`),
  ]);

  // Serie continua de 14 días (los días sin ventas valen 0), en hora de Argentina.
  const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });
  const byDay = new Map(days14.map((r) => [r.day, r.total]));
  const series = Array.from({ length: 14 }, (_, i) => {
    const key = dayKey.format(new Date(Date.now() - (13 - i) * 86400_000));
    return { key, label: key.slice(8), total: byDay.get(key) ?? 0 };
  });

  return {
    revenue30: rev.total,
    orders30: rev.n,
    pending: pending.n,
    toShip: toShip.n,
    newCustomers: newCustomers.n,
    totalCustomers: totalCustomers.n,
    lowStock,
    lowCount: lowCount.n,
    threshold: settings.lowStockThreshold,
    recent,
    series,
  };
}

/* ───────────── Productos ───────────── */

export type ProductFilter = "all" | "listed" | "hidden" | "soldout";

export async function getAdminProducts(filter: ProductFilter = "all", q = "") {
  await requireAdmin();
  const conditions = [];
  if (filter === "listed") conditions.push(eq(products.listed, true));
  if (filter === "hidden") conditions.push(eq(products.listed, false));
  if (q.trim()) {
    const term = `%${q.trim().replace(/[%_]/g, "")}%`;
    conditions.push(or(ilike(products.name, term), ilike(products.category, term)));
  }
  const rows = await db
    .select()
    .from(products)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(products.createdAt), desc(products.id));
  const vs = rows.length
    ? await db
        .select()
        .from(variants)
        .where(
          inArray(
            variants.productId,
            rows.map((r) => r.id),
          ),
        )
    : [];
  const withStock = rows.map((p) => {
    const mine = vs.filter((v) => v.productId === p.id);
    return { ...p, variantCount: mine.length, totalStock: mine.reduce((n, v) => n + v.stock, 0) };
  });
  return filter === "soldout" ? withStock.filter((p) => p.totalStock <= 0) : withStock;
}

export async function getAdminProduct(id: number) {
  await requireAdmin();
  const [[p], vs] = await Promise.all([
    db.select().from(products).where(eq(products.id, id)).limit(1),
    db.select().from(variants).where(eq(variants.productId, id)).orderBy(asc(variants.id)),
  ]);
  if (!p) return null;
  return { ...p, variants: vs };
}

export async function getProductCategories() {
  await requireAdmin();
  const rows = await db.selectDistinct({ name: products.category }).from(products).orderBy(asc(products.category));
  return rows.map((r) => r.name);
}

/* ───────────── Stock ───────────── */

export async function getStockRows(filter: "all" | "low" | "out" = "all", q = "") {
  await requireAdmin();
  const settings = await readSettings();
  const conditions = [];
  if (filter === "out") conditions.push(lte(variants.stock, 0));
  if (filter === "low") conditions.push(lte(variants.stock, settings.lowStockThreshold));
  if (q.trim()) {
    const term = `%${q.trim().replace(/[%_]/g, "")}%`;
    conditions.push(or(ilike(products.name, term), ilike(variants.sku, term), ilike(variants.size, term), ilike(variants.color, term)));
  }
  const rows = await db
    .select({
      variantId: variants.id,
      productId: products.id,
      name: products.name,
      listed: products.listed,
      size: variants.size,
      color: variants.color,
      sku: variants.sku,
      stock: variants.stock,
    })
    .from(variants)
    .innerJoin(products, eq(products.id, variants.productId))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(products.name), asc(variants.color), asc(variants.id));
  return { rows, threshold: settings.lowStockThreshold };
}

/* ───────────── Clientes ───────────── */

export async function getAdminCustomers(q = "", marketingOnly = false) {
  await requireAdmin();
  const conditions = [];
  if (marketingOnly) conditions.push(eq(customers.marketingOptIn, true));
  if (q.trim()) {
    const term = `%${q.trim().replace(/[%_]/g, "")}%`;
    conditions.push(or(ilike(customers.email, term), ilike(customers.name, term), ilike(customers.phone, term)));
  }
  return await db
    .select({
      id: customers.id,
      email: customers.email,
      name: customers.name,
      phone: customers.phone,
      source: customers.source,
      marketingOptIn: customers.marketingOptIn,
      createdAt: customers.createdAt,
      orderCount: sql<number>`(select count(*)::int from ${orders} where ${orders.customerId} = ${customers.id} and ${orders.status} in ('paid','shipped','delivered'))`,
      spent: sql<number>`(select coalesce(sum(${orders.total}), 0) from ${orders} where ${orders.customerId} = ${customers.id} and ${orders.status} in ('paid','shipped','delivered'))`,
    })
    .from(customers)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(customers.createdAt));
}

export async function getAdminCustomer(id: number) {
  await requireAdmin();
  const [[c], list] = await Promise.all([
    db.select().from(customers).where(eq(customers.id, id)).limit(1),
    db.select().from(orders).where(eq(orders.customerId, id)).orderBy(desc(orders.createdAt)),
  ]);
  if (!c) return null;
  return { ...c, orders: list };
}

/* ───────────── Ventas ───────────── */

export async function getAdminOrders(status: OrderStatus | "all" = "all", q = "") {
  await requireAdmin();
  const conditions = [];
  if (status !== "all") conditions.push(eq(orders.status, status));
  const num = Number(q.replace("#", ""));
  if (q.trim()) {
    const term = `%${q.trim().replace(/[%_]/g, "")}%`;
    conditions.push(
      or(ilike(orders.shippingName, term), Number.isInteger(num) && num > 0 ? eq(orders.number, num) : undefined, ilike(orders.shippingCity, term)),
    );
  }
  return await db
    .select({
      id: orders.id,
      number: orders.number,
      status: orders.status,
      total: orders.total,
      createdAt: orders.createdAt,
      name: orders.shippingName,
      city: orders.shippingCity,
      items: sql<number>`(select coalesce(sum(${orderItems.quantity}), 0)::int from ${orderItems} where ${orderItems.orderId} = ${orders.id})`,
    })
    .from(orders)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(orders.createdAt), desc(orders.id))
    .limit(300);
}

export async function getOrderSummary() {
  await requireAdmin();
  const rows = await db
    .select({ status: orders.status, n: count(), total: sql<number>`coalesce(sum(${orders.total}), 0)::int` })
    .from(orders)
    .groupBy(orders.status);
  const by = Object.fromEntries(rows.map((r) => [r.status, r])) as Partial<Record<OrderStatus, { n: number; total: number }>>;
  const revenue = REVENUE_STATUSES.reduce((n, s) => n + (by[s]?.total ?? 0), 0);
  const paidOrders = REVENUE_STATUSES.reduce((n, s) => n + (by[s]?.n ?? 0), 0);
  return { by, revenue, paidOrders, average: paidOrders ? Math.round(revenue / paidOrders) : 0 };
}

export async function getAdminOrder(id: number) {
  await requireAdmin();
  const [o] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!o) return null;
  const [items, [customer]] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, id)).orderBy(asc(orderItems.id)),
    o.customerId ? db.select().from(customers).where(eq(customers.id, o.customerId)).limit(1) : Promise.resolve([]),
  ]);
  return { ...o, items, customer: customer ?? null };
}

/* ───────────── Pop-ups ───────────── */

export async function getAdminPopups() {
  await requireAdmin();
  return await db.select().from(popups).orderBy(desc(popups.active), desc(popups.id));
}

export async function getAdminPopup(id: number) {
  await requireAdmin();
  const [p] = await db.select().from(popups).where(eq(popups.id, id)).limit(1);
  return p ?? null;
}

export async function getAdminHomeSections() {
  await requireAdmin();
  return readHomeSections();
}

export async function getAdminSettings() {
  await requireAdmin();
  return readSettings();
}

/* ───────────── Athletes ───────────── */

export async function getAdminAthletes() {
  await requireAdmin();
  return await db.select().from(athletes).orderBy(asc(athletes.position), asc(athletes.id));
}

export async function getAdminAthlete(id: number) {
  await requireAdmin();
  const [a] = await db.select().from(athletes).where(eq(athletes.id, id)).limit(1);
  return a ?? null;
}

/* ───────────── Arrepentimientos ───────────── */

export async function getAdminWithdrawals() {
  await requireAdmin();
  return db.select().from(schema.withdrawals).orderBy(desc(schema.withdrawals.createdAt)).limit(200);
}
