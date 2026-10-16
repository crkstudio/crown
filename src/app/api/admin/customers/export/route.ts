import { getSession } from "@/lib/auth";
import { getAdminCustomers } from "@/lib/admin-queries";

/** Neutraliza fórmulas de planilla (=, +, -, @) para que un nombre malicioso no se ejecute al abrir el CSV. */
function cell(value: string | number | null | undefined) {
  let s = String(value ?? "");
  const looksLikePhone = /^\+?[\d\s()-]+$/.test(s); // solo dígitos y símbolos de teléfono: no puede ser una fórmula
  if (!looksLikePhone && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  if (!(await getSession())) return new Response("No autorizado", { status: 401 });
  const rows = await getAdminCustomers();
  const header = ["Nombre", "Email", "Teléfono", "Origen", "Acepta novedades", "Pedidos pagados", "Total gastado (ARS)", "Alta"];
  const lines = rows.map((c) =>
    [c.name, c.email, c.phone, c.source, c.marketingOptIn ? "Sí" : "No", c.orderCount, c.spent, c.createdAt.toISOString().slice(0, 10)].map(cell).join(","),
  );
  const csv = "﻿" + [header.map(cell).join(","), ...lines].join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="clientes-crown-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
