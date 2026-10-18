import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/** Timestamp con zona horaria, con valor por defecto "ahora" (se guarda en UTC). */
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

/*
 * RLS activado en todas las tablas y SIN políticas: la app se conecta directo a Postgres con el
 * usuario dueño de la base (que ignora RLS), pero Supabase también expone el esquema "public" por
 * su API REST con la clave anon. Sin políticas, esa vía queda cerrada.
 */

/* ───────────── Administradores ───────────── */
export const admins = pgTable("admins", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: createdAt(),
}).enableRLS();

/* ───────────── Catálogo ───────────── */
export const products = pgTable(
  "products",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    category: text("category").notNull().default("General"),
    /** Precio en pesos argentinos (enteros). */
    price: integer("price").notNull(),
    /** Precio anterior (tachado) — opcional. */
    compareAtPrice: integer("compare_at_price"),
    /** Lista de URLs de las fotos. */
    images: jsonb("images").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    /** Si está en false, no aparece en la tienda pública. */
    listed: boolean("listed").notNull().default(true),
    featured: boolean("featured").notNull().default(false),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("products_slug_idx").on(t.slug)],
).enableRLS();

/** Cada combinación talle/color tiene su propio stock. */
export const variants = pgTable(
  "variants",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    size: text("size").notNull().default("Único"),
    color: text("color").notNull().default("Negro"),
    sku: text("sku"),
    stock: integer("stock").notNull().default(0),
  },
  (t) => [index("variants_product_idx").on(t.productId)],
).enableRLS();

/* ───────────── Clientes y pedidos ───────────── */
export const customers = pgTable("customers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: text("email").notNull().unique(),
  name: text("name"),
  phone: text("phone"),
  /** De dónde llegó: checkout, popup, manual. */
  source: text("source").notNull().default("checkout"),
  marketingOptIn: boolean("marketing_opt_in").notNull().default(false),
  createdAt: createdAt(),
}).enableRLS();

export const ORDER_STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const orders = pgTable(
  "orders",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
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
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("orders_number_idx").on(t.number), index("orders_status_idx").on(t.status)],
).enableRLS();

export const orderItems = pgTable(
  "order_items",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
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
).enableRLS();

/* ───────────── Pop-ups comerciales ───────────── */
export const POPUP_AUDIENCES = ["new", "all"] as const;
export const POPUP_TRIGGERS = ["load", "delay", "exit"] as const;

export const popups = pgTable("popups", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  /** Nombre interno, solo lo ve el equipo. */
  name: text("name").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  ctaLabel: text("cta_label").notNull().default("Quiero mi descuento"),
  ctaUrl: text("cta_url"),
  /** Si está activo, pide el email y lo guarda como cliente. */
  collectEmail: boolean("collect_email").notNull().default(true),
  discountCode: text("discount_code"),
  audience: text("audience").$type<(typeof POPUP_AUDIENCES)[number]>().notNull().default("new"),
  trigger: text("trigger").$type<(typeof POPUP_TRIGGERS)[number]>().notNull().default("delay"),
  delaySeconds: integer("delay_seconds").notNull().default(4),
  active: boolean("active").notNull().default(false),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  views: integer("views").notNull().default(0),
  conversions: integer("conversions").notNull().default(0),
  createdAt: createdAt(),
}).enableRLS();

/* ───────────── Ajustes de la tienda ───────────── */
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
}).enableRLS();

export type Product = typeof products.$inferSelect;
export type Variant = typeof variants.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Popup = typeof popups.$inferSelect;
