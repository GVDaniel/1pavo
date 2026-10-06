import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { repos } from '@/api';
import { useCartStore } from '@/store/cartStore';
import { useTenantStore } from '@/store/tenantStore';
import { toast } from '@/store/toastStore';
import { DeliveryLocation } from '@/types';

export type SwitchResult = 'ok' | 'no-city' | 'no-store';

/**
 * Resuelve ciudad + tienda para una ubicación, la activa y revalida la cesta
 * (precios y stock cambian entre tiendas).
 */
export function useSwitchLocation() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  async function switchTo(address: DeliveryLocation): Promise<SwitchResult> {
    setLoading(true);
    useTenantStore.getState().setLastAttempt(address.location);
    try {
      const { tenant, store } = await repos.tenant.resolveByLocation(address.location);
      if (!tenant) return 'no-city';
      if (!store) return 'no-store';
      const prevStore = useTenantStore.getState().storeId;
      useTenantStore.getState().setLocation({ tenant, store, address });

      const cart = useCartStore.getState();
      if (prevStore && prevStore !== store.id && cart.items.length) {
        const fresh = await repos.catalog.listProducts({
          storeId: store.id,
          ids: cart.items.map((i) => i.productId),
        });
        const { unavailable, changed } = cart.revalidate(fresh);
        if (unavailable) toast(t('location.cartUnavailable', { count: unavailable }), 'info');
        else if (changed) toast(t('location.cartPrices'), 'info');
      }
      return 'ok';
    } catch {
      toast(t('errors.generic'), 'error');
      return 'no-store';
    } finally {
      setLoading(false);
    }
  }

  return { switchTo, loading };
}
