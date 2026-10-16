/**
 * Seed de Crown.
 *   npm run db:seed          → crea admin + ajustes (+ datos demo si la base está vacía)
 *   npm run db:seed -- --no-demo → solo admin + ajustes
 */
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { count, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import path from "node:path";
import fs from "node:fs";
import * as s from "./schema";

try {
  process.loadEnvFile(".env.local");
} catch {
  /* sin .env.local: usamos variables del entorno */
}

const file = process.env.DATABASE_URL ?? path.join(process.cwd(), "data", "crown.db");
fs.mkdirSync(path.dirname(file), { recursive: true });
const sqlite = new Database(file);
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite, { schema: s });

const withDemo = !process.argv.includes("--no-demo");

/* ── Admin ── */
const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? "";
if (!email || password.length < 8) {
  console.error("Definí ADMIN_EMAIL y ADMIN_PASSWORD (mínimo 8 caracteres) en .env.local");
  process.exit(1);
}
const existingAdmin = db.select().from(s.admins).where(eq(s.admins.email, email)).get();
if (!existingAdmin) {
  db.insert(s.admins)
    .values({ email, name: "Crown Admin", passwordHash: bcrypt.hashSync(password, 12) })
    .run();
  console.log(`✔ Admin creado: ${email}`);
} else {
  console.log(`• Admin ya existía: ${email}`);
}

/* ── Ajustes ── */
const defaults: Record<string, string> = {
  store_open: "false", // la tienda arranca cerrada: el checkout no cobra
  low_stock_threshold: "5",
  shipping_flat: "6500",
  free_shipping_from: "120000",
};
for (const [key, value] of Object.entries(defaults)) {
  db.insert(s.settings).values({ key, value }).onConflictDoNothing().run();
}
console.log("✔ Ajustes listos");

/* ── Datos demo ── */
const [{ n: productCount }] = db.select({ n: count() }).from(s.products).all();
if (!withDemo || productCount > 0) {
  console.log(withDemo ? "• Ya hay productos, no se cargan datos demo" : "• Sin datos demo");
  process.exit(0);
}

type Seed = {
  name: string;
  category: string;
  price: number;
  compareAt?: number;
  featured?: boolean;
  description: string;
  sizes: string[];
  colors: string[];
};

const catalog: Seed[] = [
  { name: "Remera Dry Crown", category: "Remeras", price: 38900, featured: true, description: "Remera técnica de secado rápido. Costuras planas y corte regular para entrenar sin pensar en ella.", sizes: ["S", "M", "L", "XL"], colors: ["Negro", "Blanco"] },
  { name: "Short Run 5\"", category: "Shorts", price: 42500, featured: true, description: "Short liviano de 5 pulgadas con bolsillo trasero con cierre y malla interior.", sizes: ["S", "M", "L", "XL"], colors: ["Negro", "Gris"] },
  { name: "Buzo Oversize Crown", category: "Buzos", price: 89900, compareAt: 109900, featured: true, description: "Buzo oversize de algodón peinado, felpa interna suave y logo bordado en el pecho.", sizes: ["S", "M", "L", "XL"], colors: ["Negro", "Blanco"] },
  { name: "Calza Sculpt Alta", category: "Calzas", price: 54900, featured: true, description: "Calza de tiro alto, tela opaca que no se transparenta y cintura que no se enrolla.", sizes: ["XS", "S", "M", "L"], colors: ["Negro", "Gris"] },
  { name: "Top Base", category: "Tops", price: 36900, description: "Top de soporte medio con espalda cruzada y copas removibles.", sizes: ["XS", "S", "M", "L"], colors: ["Negro", "Blanco"] },
  { name: "Campera Windbreaker", category: "Camperas", price: 129900, description: "Rompevientos ultraliviano, repelente al agua, se guarda en su propio bolsillo.", sizes: ["S", "M", "L", "XL"], colors: ["Negro"] },
  { name: "Short Térmico Compression", category: "Shorts", price: 33900, description: "Short de compresión para usar solo o debajo del short de running.", sizes: ["S", "M", "L", "XL"], colors: ["Negro"] },
  { name: "Musculosa Training", category: "Remeras", price: 31900, description: "Musculosa de corte amplio en las sisas, ideal para pesas y verano.", sizes: ["S", "M", "L", "XL"], colors: ["Blanco", "Gris"] },
  { name: "Gorra Crown Run", category: "Accesorios", price: 24900, description: "Gorra de nylon liviano con ajuste trasero y visera curva.", sizes: ["Único"], colors: ["Negro", "Blanco"] },
  { name: "Medias Pack x3", category: "Accesorios", price: 14900, description: "Pack de tres pares de medias con refuerzo en talón y puntera.", sizes: ["Único"], colors: ["Blanco", "Negro"] },
];

// Generador pseudoaleatorio determinístico (la demo siempre se ve igual)
let seedState = 20261015;
const rand = () => {
  seedState = (seedState * 1664525 + 1013904223) % 4294967296;
  return seedState / 4294967296;
};
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const slugify = (v: string) =>
  v.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const allVariants: { id: number; productId: number; size: string; color: string }[] = [];
const productRows: { id: number; name: string; price: number }[] = [];

for (const item of catalog) {
  const [p] = db
    .insert(s.products)
    .values({
      slug: slugify(item.name),
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price,
      compareAtPrice: item.compareAt ?? null,
      featured: item.featured ?? false,
      listed: true,
      images: [],
    })
    .returning()
    .all();
  productRows.push({ id: p.id, name: p.name, price: p.price });
  for (const size of item.sizes) {
    for (const color of item.colors) {
      const stock = Math.floor(rand() * 22);
      const [v] = db
        .insert(s.variants)
        .values({
          productId: p.id,
          size,
          color,
          stock,
          sku: `CRW-${p.id.toString().padStart(3, "0")}-${slugify(size).toUpperCase()}-${color.slice(0, 3).toUpperCase()}`,
        })
        .returning()
        .all();
      allVariants.push({ id: v.id, productId: p.id, size, color });
    }
  }
}
// Un par de variantes agotadas / con poco stock para que el panel tenga algo que mostrar
db.update(s.variants).set({ stock: 0 }).where(eq(s.variants.id, allVariants[1].id)).run();
db.update(s.variants).set({ stock: 2 }).where(eq(s.variants.id, allVariants[5].id)).run();

// Un producto oculto de ejemplo
db.insert(s.products)
  .values({
    slug: "buzo-edicion-limitada",
    name: "Buzo Edición Limitada",
    description: "Próximo lanzamiento. Oculto hasta que lo listes desde el panel.",
    category: "Buzos",
    price: 99900,
    listed: false,
    images: [],
  })
  .run();

/* Clientes y pedidos demo */
const firstNames = ["Sofía", "Mateo", "Valentina", "Joaquín", "Camila", "Tomás", "Martina", "Lucas", "Julieta", "Bruno", "Agustina", "Nicolás", "Florencia", "Franco"];
const lastNames = ["Gómez", "Rodríguez", "Fernández", "López", "Martínez", "Pérez", "Sánchez", "Romero", "Díaz", "Álvarez"];
const cities: [string, string, string][] = [
  ["Buenos Aires", "CABA", "C1425"],
  ["Córdoba", "Córdoba", "X5000"],
  ["Rosario", "Santa Fe", "S2000"],
  ["Mendoza", "Mendoza", "M5500"],
  ["La Plata", "Buenos Aires", "B1900"],
];

const nowSec = Math.floor(Date.now() / 1000);
const customerIds: number[] = [];
for (let i = 0; i < 14; i++) {
  const first = firstNames[i % firstNames.length];
  const last = pick(lastNames);
  const [c] = db
    .insert(s.customers)
    .values({
      email: `${slugify(first)}.${slugify(last)}${i}@example.com`,
      name: `${first} ${last}`,
      phone: `+54 9 11 ${Math.floor(1000 + rand() * 8999)}-${Math.floor(1000 + rand() * 8999)}`,
      source: i % 3 === 0 ? "popup" : "checkout",
      marketingOptIn: rand() > 0.35,
      createdAt: new Date((nowSec - Math.floor(rand() * 30 * 86400)) * 1000),
    })
    .returning()
    .all();
  customerIds.push(c.id);
}

const statuses: s.OrderStatus[] = ["delivered", "delivered", "shipped", "paid", "paid", "pending", "cancelled"];
let orderNumber = 1000;
for (let i = 0; i < 28; i++) {
  const cid = pick(customerIds);
  const cust = db.select().from(s.customers).where(eq(s.customers.id, cid)).get()!;
  const [city, province, zip] = pick(cities);
  const lines = 1 + Math.floor(rand() * 3);
  let subtotal = 0;
  const items: (typeof s.orderItems.$inferInsert)[] = [];
  for (let l = 0; l < lines; l++) {
    const v = pick(allVariants);
    const prod = productRows.find((p) => p.id === v.productId)!;
    const qty = 1 + Math.floor(rand() * 2);
    subtotal += prod.price * qty;
    items.push({ orderId: 0, productId: prod.id, variantId: v.id, name: prod.name, size: v.size, color: v.color, unitPrice: prod.price, quantity: qty });
  }
  const shippingCost = subtotal >= 120000 ? 0 : 6500;
  const createdAt = new Date((nowSec - Math.floor(rand() * 30 * 86400)) * 1000);
  const [order] = db
    .insert(s.orders)
    .values({
      number: ++orderNumber,
      customerId: cid,
      status: pick(statuses),
      paymentProvider: "mercadopago",
      subtotal,
      shippingCost,
      total: subtotal + shippingCost,
      shippingName: cust.name ?? "Cliente",
      shippingPhone: cust.phone,
      shippingAddress: `Av. Ejemplo ${Math.floor(100 + rand() * 4000)}`,
      shippingCity: city,
      shippingProvince: province,
      shippingZip: zip,
      createdAt,
    })
    .returning()
    .all();
  db.insert(s.orderItems).values(items.map((it) => ({ ...it, orderId: order.id }))).run();
}

/* Un pop-up de ejemplo, apagado */
db.insert(s.popups)
  .values({
    name: "Bienvenida · 10% off",
    title: "Tu primera compra con 10% off",
    body: "Dejanos tu email y te mandamos el código. Sin spam, solo lanzamientos y descuentos.",
    ctaLabel: "Quiero mi código",
    collectEmail: true,
    discountCode: "CROWN10",
    audience: "new",
    trigger: "delay",
    delaySeconds: 5,
    active: false,
  })
  .run();

console.log("✔ Datos demo cargados: 10 productos, 14 clientes, 28 pedidos, 1 pop-up");
