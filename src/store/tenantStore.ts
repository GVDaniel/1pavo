import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DeliveryLocation, LatLng, Store, Tenant } from '@/types';
import { persistStorage } from './storage';

interface TenantState {
  tenantId: string | null;
  tenantName: string | null;
  storeId: string | null;
  storeName: string | null;
  deliveryAddress: DeliveryLocation | null;
  /** Ultima ubicacion con la que se intento resolver cobertura */
  lastAttempt: LatLng | null;
  setLocation: (p: { tenant: Tenant; store: Store; address: DeliveryLocation }) => void;
  setLastAttempt: (loc: LatLng) => void;
  clear: () => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      tenantId: null,
      tenantName: null,
      storeId: null,
      storeName: null,
      deliveryAddress: null,
      lastAttempt: null,
      setLocation: ({ tenant, store, address }) =>
        set({
          tenantId: tenant.id,
          tenantName: tenant.name,
          storeId: store.id,
          storeName: store.name,
          deliveryAddress: address,
          lastAttempt: address.location,
        }),
      setLastAttempt: (loc) => set({ lastAttempt: loc }),
      clear: () =>
        set({
          tenantId: null,
          tenantName: null,
          storeId: null,
          storeName: null,
          deliveryAddress: null,
          lastAttempt: null,
        }),
    }),
    { name: '1pavo-tenant', storage: persistStorage },
  ),
);
