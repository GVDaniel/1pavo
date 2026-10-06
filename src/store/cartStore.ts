import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Promo, StoreProduct } from '@/types';
import { persistStorage } from './storage';

interface CartState {
  items: CartItem[];
  promo: Promo | null;
  add: (p: StoreProduct, qty?: number) => void;
  setQuantity: (productId: string, qty: number) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  remove: (productId: string) => void;
  removeWhere: (fn: (i: CartItem) => boolean) => void;
  clear: () => void;
  applyPromo: (p: Promo) => void;
  removePromo: () => void;
  /** Sustituye precios/stock tras cambiar de tienda */
  revalidate: (fresh: StoreProduct[]) => { changed: number; unavailable: number };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      promo: null,
      add: (product, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.productId === product.id);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.productId === product.id ? { ...i, quantity: i.quantity + qty, product } : i,
              ),
            };
          }
          return { items: [...s.items, { productId: product.id, quantity: qty, product }] };
        }),
      setQuantity: (productId, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.productId !== productId)
              : s.items.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i)),
        })),
      increment: (id) => {
        const it = get().items.find((i) => i.productId === id);
        if (it) get().setQuantity(id, it.quantity + 1);
      },
      decrement: (id) => {
        const it = get().items.find((i) => i.productId === id);
        if (it) get().setQuantity(id, it.quantity - 1);
      },
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.productId !== id) })),
      removeWhere: (fn) => set((s) => ({ items: s.items.filter((i) => !fn(i)) })),
      clear: () => set({ items: [], promo: null }),
      applyPromo: (promo) => set({ promo }),
      removePromo: () => set({ promo: null }),
      revalidate: (fresh) => {
        let changed = 0;
        let unavailable = 0;
        const items = get().items.map((i) => {
          const f = fresh.find((p) => p.id === i.productId);
          if (!f || !f.available) {
            unavailable++;
            return { ...i, unavailable: true };
          }
          if (f.price !== i.product.price) changed++;
          return { ...i, product: f, unavailable: false };
        });
        set({ items });
        return { changed, unavailable };
      },
    }),
    { name: '1pavo-cart', storage: persistStorage, partialize: (s) => ({ items: s.items, promo: s.promo }) },
  ),
);

export const useCartCount = () => useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
export const useCartQuantity = (id: string) =>
  useCartStore((s) => s.items.find((i) => i.productId === id)?.quantity ?? 0);
