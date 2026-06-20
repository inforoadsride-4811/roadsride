'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((item) => item.id === product.id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                id: product.id,
                name: product.name,
                slug: product.slug,
                packName: product.packName,
                price: product.price,
                originalPrice: product.originalPrice,
                image: product.images?.[0]?.src || product.image,
                quantity,
              },
            ],
          };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getOriginalSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.originalPrice * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      getSavings: () => {
        const state = get();
        return state.items.reduce(
          (total, item) =>
            total + (item.originalPrice - item.price) * item.quantity,
          0
        );
      },

      getCartForCheckout: () => {
        return get().items.map((item) => ({
          productName: item.name,
          productSlug: item.slug,
          packName: item.packName,
          quantity: item.quantity,
          price: item.price,
          originalPrice: item.originalPrice,
          image: item.image,
        }));
      },
    }),
    {
      name: 'roadsride-cart',
    }
  )
);

export default useCartStore;
