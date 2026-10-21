import type { Metadata } from "next";
import { NotFoundView } from "@/components/not-found-view";

export const metadata: Metadata = { title: "Página no encontrada", robots: { index: false } };

// Se muestra dentro del layout de la tienda (con menú y pie) cuando una página llama a notFound().
export default function StoreNotFound() {
  return <NotFoundView />;
}
