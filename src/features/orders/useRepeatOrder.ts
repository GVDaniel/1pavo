import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { repos } from '@/api';
import { useCartStore } from '@/store/cartStore';
import { useTenantStore } from '@/store/tenantStore';
import { toast } from '@/store/toastStore';
import { Order } from '@/types';

export function useRepeatOrder() {
  const { t } = useTranslation();
  return async (order: Order) => {
    const storeId = useTenantStore.getState().storeId;
    if (!storeId) return;
    const fresh = await repos.catalog.listProducts({ storeId, ids: order.items.map((i) => i.productId) });
    let added = 0;
    order.items.forEach((i) => {
      const p = fresh.find((f) => f.id === i.productId);
      if (p?.available) {
        useCartStore.getState().add(p, i.quantity);
        added++;
      }
    });
    const missing = order.items.length - added;
    toast(missing ? t('orders.repeatPartial', { count: missing }) : t('orders.repeatDone'), 'success');
    router.push('/cart');
  };
}
