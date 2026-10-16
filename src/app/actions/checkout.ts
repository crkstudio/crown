"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { z } from "zod";
import { cancelOrderAndRestock, createOrder, OrderError } from "@/lib/orders";
import { readSettings } from "@/lib/queries";
import { getPaymentProvider } from "@/lib/payments";

export type CheckoutState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
  /** Lo que escribió el cliente: React 19 vacía el formulario después de cada acción, así lo recuperamos. */
  values?: Partial<Record<string, string>>;
};

const required = (label: string, min = 2, max = 160) =>
  z.string().trim().min(min, `Completá ${label}`).max(max, `${label} es demasiado largo`);

const schema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Ingresá un email válido")),
  name: required("tu nombre completo", 3, 120),
  phone: required("un teléfono de contacto", 6, 40),
  address: required("la dirección de envío", 4),
  city: required("la ciudad", 2, 80),
  province: required("la provincia", 2, 60),
  zip: required("el código postal", 3, 12),
  notes: z.string().trim().max(500).optional(),
  marketing: z.boolean(),
  items: z
    .array(z.object({ variantId: z.number().int().positive(), quantity: z.number().int().min(1).max(20) }))
    .min(1, "Tu carrito está vacío")
    .max(50),
});

export async function placeOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const values: Record<string, string> = {};
  for (const key of ["email", "name", "phone", "address", "city", "province", "zip", "notes", "marketing"]) {
    const v = formData.get(key);
    if (typeof v === "string") values[key] = v;
  }

  // 1) Interruptor general: mientras la tienda esté cerrada no se crea ningún pedido.
  const settings = await readSettings();
  if (!settings.storeOpen) {
    return { values, error: "La tienda todavía no está habilitada para comprar. Volvé pronto." };
  }

  // 2) Validar datos
  let rawItems: unknown = [];
  try {
    rawItems = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { values, error: "No pudimos leer tu carrito. Actualizá la página e intentá de nuevo." };
  }
  const parsed = schema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    city: formData.get("city"),
    province: formData.get("province"),
    zip: formData.get("zip"),
    notes: formData.get("notes") || undefined,
    marketing: formData.get("marketing") === "on",
    items: rawItems,
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { values, fieldErrors, error: fieldErrors.items };
  }
  const d = parsed.data;

  // 3) La pasarela tiene que estar lista ANTES de reservar stock.
  const provider = getPaymentProvider();
  if (!provider.isConfigured()) {
    return { values, error: "Los pagos todavía no están configurados. Avisanos y lo resolvemos." };
  }

  // 4) Crear pedido + reservar stock (transacción)
  let created: ReturnType<typeof createOrder>;
  try {
    created = createOrder({
      customer: { email: d.email, name: d.name, phone: d.phone, marketing: d.marketing },
      shipping: { name: d.name, phone: d.phone, address: d.address, city: d.city, province: d.province, zip: d.zip, notes: d.notes },
      lines: d.items,
      settings,
    });
  } catch (e) {
    if (e instanceof OrderError) return { values, error: e.message };
    console.error("[checkout] createOrder", e);
    return { values, error: "No pudimos crear tu pedido. Probá de nuevo en un momento." };
  }
  updateTag("products"); // el stock cambió

  // 5) Abrir el pago. Si falla, se cancela el pedido y vuelve el stock.
  let redirectUrl: string;
  try {
    const res = await provider.createCheckout({
      orderId: created.order.id,
      orderNumber: created.order.number,
      items: created.items,
      shippingCost: created.order.shippingCost,
      payerEmail: d.email,
      payerName: d.name,
    });
    redirectUrl = res.redirectUrl;
  } catch (e) {
    console.error("[checkout] createCheckout", e);
    cancelOrderAndRestock(created.order.id);
    updateTag("products");
    return { values, error: "No pudimos iniciar el pago. No se te cobró nada; probá de nuevo." };
  }

  redirect(redirectUrl);
}
