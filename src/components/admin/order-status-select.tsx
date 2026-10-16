"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/app/actions/admin/orders";
import { ORDER_STATUSES, type OrderStatus } from "@/db/schema";
import { ORDER_STATUS_LABEL } from "@/lib/labels";

export function OrderStatusSelect({ orderId, status }: { orderId: number; status: OrderStatus }) {
  const [current, setCurrent] = useState(status);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const locked = current === "cancelled";

  function change(next: OrderStatus) {
    if (next === current) return;
    if (next === "cancelled" && !window.confirm("¿Cancelar este pedido?\n\nEl stock de sus productos vuelve al inventario y no se puede reabrir.")) return;
    setError("");
    const previous = current;
    setCurrent(next);
    start(async () => {
      const res = await updateOrderStatus(orderId, next);
      if (res.error) {
        setCurrent(previous);
        setError(res.error);
      }
    });
  }

  return (
    <div>
      <label htmlFor="order-status" className="mb-1.5 block text-sm font-semibold">
        Estado del pedido
      </label>
      <select id="order-status" value={current} disabled={pending || locked} onChange={(e) => change(e.target.value as OrderStatus)} className="field">
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      {locked && <p className="mt-2 text-sm text-muted">Cancelado: el stock ya volvió al inventario.</p>}
      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}
