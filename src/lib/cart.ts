"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  variantId: number;
  productId: number;
  slug: string;
  name: string;
  size: string;
  color: string;
  price: number;
  image: string | null;
  quantity: number;
  /** Stock conocido al momento de agregar. El servidor vuelve a validarlo al comprar. */
  maxStock: number;
};

type CartState = {
  lines: CartLine[];
  isOpen: boolean;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (variantId: number, quantity: number) => void;
  remove: (variantId: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      add: (line, quantity = 1) =>
        set((s) => {
          const existing = s.lines.find((l) => l.variantId === line.variantId);
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                l.variantId === line.variantId
                  ? { ...l, maxStock: line.maxStock, price: line.price, quantity: Math.min(l.quantity + quantity, line.maxStock) }
                  : l,
              ),
              isOpen: true,
            };
          }
          return { lines: [...s.lines, { ...line, quantity: Math.min(quantity, line.maxStock) }], isOpen: true };
        }),
      setQuantity: (variantId, quantity) =>
        set((s) => ({
          lines: s.lines
            .map((l) => (l.variantId === variantId ? { ...l, quantity: Math.max(0, Math.min(quantity, l.maxStock)) } : l))
            .filter((l) => l.quantity > 0),
        })),
      remove: (variantId) => set((s) => ({ lines: s.lines.filter((l) => l.variantId !== variantId) })),
      clear: () => set({ lines: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    {
      name: "crown-cart",
      version: 1,
      partialize: (s) => ({ lines: s.lines }),
    },
  ),
);

/** false durante SSR y la hidratación, true después: evita desajustes con el carrito guardado. */
export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0);
export const cartSubtotal = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity * l.price, 0);

export function shippingFor(subtotal: number, flat: number, freeFrom: number) {
  if (subtotal <= 0) return 0;
  return subtotal >= freeFrom ? 0 : flat;
}
