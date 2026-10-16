"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart";

/** Vacía el carrito cuando el cliente vuelve de pagar. */
export function ClearCart() {
  const clear = useCart((s) => s.clear);
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
