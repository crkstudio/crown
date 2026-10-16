import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/admin/ui";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { getAdminOrder } from "@/lib/admin-queries";
import { formatDateTime, formatPrice } from "@/lib/utils";

export const metadata = { title: "Pedido" };

export default async function OrderPage(props: PageProps<"/admin/ventas/[id]">) {
  const { id: raw } = await props.params;
  const id = Number(raw);
  if (!Number.isInteger(id)) notFound();
  const o = await getAdminOrder(id);
  if (!o) notFound();

  return (
    <>
      <Link href="/admin/ventas" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold hover:underline">
        <ChevronLeft size={16} /> Ventas
      </Link>
      <PageHeader title={`Pedido #${o.number}`} description={formatDateTime(o.createdAt)} actions={<StatusBadge status={o.status} />} />

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="panel p-6" aria-labelledby="items">
          <h2 id="items" className="mb-4 font-bold">
            Productos
          </h2>
          <ul className="divide-y divide-line">
            {o.items.map((it) => (
              <li key={it.id} className="flex items-start justify-between gap-4 py-3.5 text-sm">
                <div>
                  <p className="font-semibold">
                    {it.productId ? (
                      <Link href={`/admin/productos/${it.productId}`} className="hover:underline">
                        {it.name}
                      </Link>
                    ) : (
                      it.name
                    )}
                  </p>
                  <p className="text-muted">
                    Talle {it.size} · {it.color} · {it.quantity} × {formatPrice(it.unitPrice)}
                  </p>
                </div>
                <p className="font-semibold whitespace-nowrap">{formatPrice(it.unitPrice * it.quantity)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-semibold">{formatPrice(o.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Envío</dt>
              <dd className="font-semibold">{o.shippingCost === 0 ? "Gratis" : formatPrice(o.shippingCost)}</dd>
            </div>
            <div className="flex items-baseline justify-between pt-2 text-base">
              <dt className="font-bold">Total</dt>
              <dd className="text-xl font-bold">{formatPrice(o.total)}</dd>
            </div>
          </dl>
        </section>

        <div className="space-y-6">
          <section className="panel p-6">
            <OrderStatusSelect orderId={o.id} status={o.status} />
          </section>

          <section className="panel p-6 text-sm" aria-labelledby="ship">
            <h2 id="ship" className="mb-3 font-bold">
              Envío
            </h2>
            <address className="space-y-0.5 not-italic">
              <p className="font-semibold">{o.shippingName}</p>
              <p>{o.shippingAddress}</p>
              <p>
                {o.shippingCity}, {o.shippingProvince} ({o.shippingZip})
              </p>
              {o.shippingPhone && <p className="text-muted">{o.shippingPhone}</p>}
            </address>
            {o.notes && (
              <p className="mt-3 rounded-xl bg-neutral-100 p-3">
                <span className="font-semibold">Nota del cliente: </span>
                {o.notes}
              </p>
            )}
          </section>

          <section className="panel p-6 text-sm" aria-labelledby="cust">
            <h2 id="cust" className="mb-3 font-bold">
              Cliente y pago
            </h2>
            {o.customer ? (
              <p>
                <Link href={`/admin/clientes/${o.customer.id}`} className="font-semibold hover:underline">
                  {o.customer.name ?? o.customer.email}
                </Link>
                <span className="block text-muted">{o.customer.email}</span>
              </p>
            ) : (
              <p className="text-muted">Cliente eliminado</p>
            )}
            <p className="mt-3 text-muted">
              {o.paymentProvider ?? "—"}
              {o.paymentId && <span className="block break-all">ID de pago: {o.paymentId}</span>}
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
