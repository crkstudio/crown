import type { OrderStatus } from "@/db/schema";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pendiente de pago",
  paid: "Pagado",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

/** Estados que cuentan como venta concretada (ingresos). */
export const REVENUE_STATUSES: OrderStatus[] = ["paid", "shipped", "delivered"];

export const SOURCE_LABEL: Record<string, string> = {
  checkout: "Compra",
  popup: "Pop-up",
  manual: "Manual",
};

export const AUDIENCE_LABEL = { new: "Visitantes nuevos", all: "Todos los visitantes" } as const;
export const TRIGGER_LABEL = {
  load: "Al entrar",
  delay: "Después de unos segundos",
  exit: "Al intentar salir",
} as const;
