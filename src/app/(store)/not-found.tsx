import type { Metadata } from "next";
import { NotFoundView } from "@/components/not-found-view";

export const metadata: Metadata = { title: "Página no encontrada", robots: { index: false } };

// URLs que no existen en ninguna parte del sitio.
export default function NotFound() {
  return <NotFoundView />;
}
