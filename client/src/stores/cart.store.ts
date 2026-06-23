import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartState } from './types';
import { devtools } from 'zustand/middleware'

export const useCartStore = create<CartState>()(
  devtools(persist((set, get) => ({
    items: [],
  

    addItem: (item) => set((state) => {
      const existingItem = state.items.find((i) => i.productId === item.productId);
      if (existingItem) {
        return {
          items: state.items.map((i) => i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i),
        };
      }
      return {
        items: [...state.items, { ...item, quantity: 1 }],
      };
    }),

    removeItem: (productId) => set((state) => ({
      items: state.items.filter((item) => item.productId !== productId),
    })),

    increaseQuantity: (productId) => set((state) => ({
      items: state.items.map((item) => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item),
    })),

    decreaseQuantity: (productId) => set((state) => ({
      items: state.items.map((item) => item.productId === productId ? { ...item, quantity: Math.max(1, item.quantity - 1 )} : item),
    })),

    clearCart: () => set({ items: [] }),

    totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),

    subtotal: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
  }),
  {
    name: "cart-storage",
  }
  ))
);

