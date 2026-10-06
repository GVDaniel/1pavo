import { categories } from '@/mocks/categories';
import { products } from '@/mocks/products';
import { bannersFor, trendingSearches } from '@/mocks/promos';
import { tenants } from '@/mocks/tenants';
import { Daypart, Product, StoreProduct } from '@/types';
import { discountPct, normalize } from '@/utils/format';
import { hash } from '@/utils/hash';
import { ApiError } from '../errors';
import { CatalogRepository } from '../repositories';
import { mock } from './util';

/** Precio y stock varían ligeramente por tienda (determinista) */
export function toStoreProduct(p: Product, storeId: string): StoreProduct {
  const h = hash(storeId + p.id);
  const factor = 1 + ((h % 7) - 3) / 100;
  const r = (n: number) => Math.round(n * factor * 100) / 100;
  const stock = h % 19 === 0 ? 0 : 3 + (h % 40);
  return {
    ...p,
    storeId,
    price: r(p.basePrice),
    oldPrice: p.baseOldPrice ? r(p.baseOldPrice) : undefined,
    stock,
    available: stock > 0,
  };
}

const DAYPART_CATEGORIES: Record<Daypart, string[]> = {
  morning: ['panaderia', 'desayuno', 'lacteos'],
  afternoon: ['bebidas', 'helados', 'snacks'],
  night: ['snacks', 'alcohol', 'listo', 'congelados'],
  late: ['chuches', 'snacks', 'listo', 'emergencias'],
};

export const mockCatalog: CatalogRepository = {
  listCategories: () => mock(() => categories),

  listProducts: (f) =>
    mock(() => {
      const q = f.query ? normalize(f.query) : '';
      let list = products
        .filter((p) => !f.categoryId || p.categoryId === f.categoryId)
        .filter((p) => !f.subcategoryId || p.subcategoryId === f.subcategoryId)
        .filter((p) => !f.ids || f.ids.includes(p.id))
        .filter((p) => !f.tags?.length || f.tags.every((t) => p.tags.includes(t)))
        .filter((p) => {
          if (!q) return true;
          const cat = categories.find((c) => c.id === p.categoryId)?.name ?? '';
          return normalize(`${p.name} ${p.format} ${cat}`).includes(q);
        })
        .map((p) => toStoreProduct(p, f.storeId));

      switch (f.sort) {
        case 'price_asc':
          list.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          list.sort((a, b) => b.price - a.price);
          break;
        case 'offers':
          list.sort((a, b) => discountPct(b.price, b.oldPrice) - discountPct(a.price, a.oldPrice));
          break;
        default:
          if (q) list.sort((a, b) => Number(normalize(b.name).startsWith(q)) - Number(normalize(a.name).startsWith(q)));
      }
      if (f.limit) list = list.slice(0, f.limit);
      return list;
    }),

  getProduct: (storeId, id) =>
    mock(() => {
      const p = products.find((x) => x.id === id);
      if (!p) throw new ApiError('NOT_FOUND', 'Este producto ya no está disponible.');
      return toStoreProduct(p, storeId);
    }),

  getRelated: (storeId, id) =>
    mock(() => {
      const p = products.find((x) => x.id === id);
      if (!p) return [];
      const pairs: Record<string, string[]> = {
        alcohol: ['snacks', 'congelados'],
        snacks: ['bebidas', 'alcohol'],
        bebidas: ['snacks', 'congelados'],
        panaderia: ['desayuno', 'lacteos'],
        desayuno: ['panaderia', 'lacteos'],
        helados: ['chuches'],
      };
      const cats = pairs[p.categoryId] ?? [p.categoryId];
      return products
        .filter((x) => x.id !== id && (cats.includes(x.categoryId) || x.subcategoryId === p.subcategoryId))
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 8)
        .map((x) => toStoreProduct(x, storeId));
    }),

  getHomeFeed: (tenantId, storeId, daypart) =>
    mock(() => {
      const tenant = tenants.find((t) => t.id === tenantId);
      const all = products.map((p) => toStoreProduct(p, storeId)).filter((p) => p.available);
      const ends = new Date();
      ends.setHours(ends.getHours() + 2, 0, 0, 0);
      return {
        banners: bannersFor(tenant?.name ?? 'Tu ciudad'),
        flashDeals: all
          .filter((p) => p.oldPrice)
          .sort((a, b) => discountPct(b.price, b.oldPrice) - discountPct(a.price, a.oldPrice))
          .slice(0, 8),
        flashEndsAt: ends.toISOString(),
        forNow: all
          .filter((p) => DAYPART_CATEGORIES[daypart].includes(p.categoryId))
          .sort((a, b) => b.popularity - a.popularity)
          .slice(0, 10),
        popular: [...all].sort((a, b) => b.popularity - a.popularity).slice(0, 10),
        daypart,
      };
    }),

  getBanners: (tenantId) => mock(() => bannersFor(tenants.find((t) => t.id === tenantId)?.name ?? '')),

  trendingSearches: () => mock(() => trendingSearches),
};
