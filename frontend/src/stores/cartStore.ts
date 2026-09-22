import { create } from "zustand";
import type { Product } from "@/types";

export interface CartLine {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  stock: number | null;
}

interface CartState {
  lines: CartLine[];
  addProduct: (product: Product) => void;
  incrementLine: (productId: string) => void;
  decrementLine: (productId: string) => void;
  removeLine: (productId: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  lines: [],
  addProduct: (product) =>
    set((state) => {
      const existing = state.lines.find((line) => line.productId === product._id);
      if (existing) {
        return {
          lines: state.lines.map((line) =>
            line.productId === product._id ? { ...line, quantity: line.quantity + 1 } : line,
          ),
        };
      }
      return {
        lines: [
          ...state.lines,
          { productId: product._id, name: product.name, price: product.price, quantity: 1, stock: product.stock },
        ],
      };
    }),
  incrementLine: (productId) =>
    set((state) => ({
      lines: state.lines.map((line) =>
        line.productId === productId ? { ...line, quantity: line.quantity + 1 } : line,
      ),
    })),
  decrementLine: (productId) =>
    set((state) => ({
      lines: state.lines
        .map((line) => (line.productId === productId ? { ...line, quantity: line.quantity - 1 } : line))
        .filter((line) => line.quantity > 0),
    })),
  removeLine: (productId) =>
    set((state) => ({ lines: state.lines.filter((line) => line.productId !== productId) })),
  clear: () => set({ lines: [] }),
}));

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
}

export function cartItemCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}
