'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Debounce helper
let syncTimer = null;
const debouncedSync = (items) => {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    try {
      const { syncCartToDB } = await import('@/actions/cart');
      await syncCartToDB(items);
    } catch (e) {
      // Silent fail — localStorage is the fallback
    }
  }, 1000);
};

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      _synced: false, // whether DB cart has been loaded this session

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((item) => item.id === product.id);
          let newItems;
          if (existing) {
            newItems = state.items.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            newItems = [
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
            ];
          }
          debouncedSync(newItems);
          return { items: newItems };
        });
      },

      removeItem: (id) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== id);
          debouncedSync(newItems);
          return { items: newItems };
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) return;
        set((state) => {
          const newItems = state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          );
          debouncedSync(newItems);
          return { items: newItems };
        });
      },

      clearCart: () => {
        set({ items: [] });
        // Also clear in DB (fire-and-forget)
        import('@/actions/cart').then(({ clearCartInDB }) => clearCartInDB()).catch(() => {});
      },

      // Load cart from DB for logged-in user — merges with local cart
      loadFromDB: async () => {
        if (get()._synced) return;
        try {
          const { loadCartFromDB } = await import('@/actions/cart');
          const { success, items: dbItems } = await loadCartFromDB();
          if (success && dbItems.length > 0) {
            const localItems = get().items;
            const merged = [...dbItems];
            for (const localItem of localItems) {
              const exists = merged.find((m) => m.id === localItem.id);
              if (exists) {
                exists.quantity = Math.max(exists.quantity, localItem.quantity);
              } else {
                merged.push(localItem);
              }
            }
            set({ items: merged, _synced: true });
          } else {
            set({ _synced: true });
          }
        } catch (e) {
          set({ _synced: true });
        }
      },

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
      partialize: (state) => ({ items: state.items }), // Don't persist _synced flag
    }
  )
);

export default useCartStore;
