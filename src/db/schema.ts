import { sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";

const now = sql`(unixepoch())`;

/* ───────────── Administradores ───────────── */
export const admins = sqliteTable("admins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(now),
});

/* ───────────── Catálogo ───────────── */
export const products = sqliteTable(
  "products",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    category: text("category").notNull().default("General"),
    /** Precio en pesos argentinos (enteros). */
    price: integer("price").notNull(),
    /** Precio anterior (tachado) — opcional. */
    compareAtPrice: integer("compare_at_price"),
    /** Lista de URLs serializada como JSON. */
    images: text("images", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
    /** Si está en false, no aparece en la tienda pública. */
    listed: integer("listed", { mode: "boolean" }).notNull().default(true),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(now),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(now),
  },
  (t) => [uniqueIndex("products_slug_idx").on(t.slug)],
);

/** Cada combinación talle/color tiene su propio stock. */
export const variants = sqliteTable(
  "variants",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    size: text("size").notNull().default("Único"),
    color: text("color").notNull().default("Negro"),
    sku: text("sku"),
    stock: integer("stock").notNull().default(0),
  },
  (t) => [index("variants_product_idx").on(t.productId)],
);

/* ───────────── Clientes y pedidos ───────────── */
export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name"),
  phone: text("phone"),
  /** De dónde llegó: checkout, popup, manual. */
  source: text("source").notNull().default("checkout"),
  marketingOptIn: integer("marketing_opt_in", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(now),
});

export const ORDER_STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const orders = sqliteTable(
  "orders",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** Número visible para el cliente (#1001, #1002…). */
    number: integer("number").notNull(),
    customerId: integer("customer_id").references(() => customers.id, { onDelete: "set null" }),
    status: text("status").$type<OrderStatus>().notNull().default("pending"),
    paymentProvider: text("payment_provider"),
    paymentId: text("payment_id"),
    subtotal: integer("subtotal").notNull(),
    shippingCost: integer("shipping_cost").notNull().default(0),
    total: integer("total").notNull(),
    shippingName: text("shipping_name").notNull(),
    shippingPhone: text("shipping_phone"),
    shippingAddress: text("shipping_address").notNull(),
    shippingCity: text("shipping_city").notNull(),
    shippingProvince: text("shipping_province").notNull(),
    shippingZip: text("shipping_zip").notNull(),
    notes: text("notes"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(now),
  },
  (t) => [uniqueIndex("orders_number_idx").on(t.number), index("orders_status_idx").on(t.status)],
);

export const orderItems = sqliteTable(
  "order_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    // Si se borra el producto, el pedido conserva su "foto" (nombre, precio, talle…).
    productId: integer("product_id").references(() => products.id, { onDelete: "set null" }),
    variantId: integer("variant_id").references(() => variants.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    size: text("size").notNull(),
    color: text("color").notNull(),
    image: text("image"),
    unitPrice: integer("unit_price").notNull(),
    quantity: integer("quantity").notNull(),
  },
  (t) => [index("order_items_order_idx").on(t.orderId)],
);

/* ───────────── Pop-ups comerciales ───────────── */
export const POPUP_AUDIENCES = ["new", "all"] as const;
export const POPUP_TRIGGERS = ["load", "delay", "exit"] as const;

export const popups = sqliteTable("popups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** Nombre interno, solo lo ve el equipo. */
  name: text("name").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  ctaLabel: text("cta_label").notNull().default("Quiero mi descuento"),
  ctaUrl: text("cta_url"),
  /** Si está activo, pide el email y lo guarda como cliente. */
  collectEmail: integer("collect_email", { mode: "boolean" }).notNull().default(true),
  discountCode: text("discount_code"),
  audience: text("audience").$type<(typeof POPUP_AUDIENCES)[number]>().notNull().default("new"),
  trigger: text("trigger").$type<(typeof POPUP_TRIGGERS)[number]>().notNull().default("delay"),
  delaySeconds: integer("delay_seconds").notNull().default(4),
  active: integer("active", { mode: "boolean" }).notNull().default(false),
  startsAt: integer("starts_at", { mode: "timestamp" }),
  endsAt: integer("ends_at", { mode: "timestamp" }),
  views: integer("views").notNull().default(0),
  conversions: integer("conversions").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(now),
});

/* ───────────── Ajustes de la tienda ───────────── */
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export type Product = typeof products.$inferSelect;
export type Variant = typeof variants.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Popup = typeof popups.$inferSelect;
