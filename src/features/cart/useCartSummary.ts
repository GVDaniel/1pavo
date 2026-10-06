import { useMemo } from 'react';
import { useCurrentTenant } from '@/hooks/queries';
import { useCartStore } from '@/store/cartStore';
import { computeTotals } from './pricing';

export function useCartSummary(tip = 0) {
  const items = useCartStore((s) => s.items);
  const promo = useCartStore((s) => s.promo);
  const { data: tenant } = useCurrentTenant();

  return useMemo(() => {
    const available = items.filter((i) => !i.unavailable);
    const subtotal = available.reduce((n, i) => n + i.product.price * i.quantity, 0);
    const count = available.reduce((n, i) => n + i.quantity, 0);
    const hasAlcohol = available.some((i) => i.product.ageRestricted);
    const unavailableCount = items.length - available.length;
    if (!tenant) {
      return { ready: false as const, subtotal, count, hasAlcohol, unavailableCount, items };
    }
    const totals = computeTotals({ subtotal, config: tenant.config, promo, tip });
    return {
      ready: true as const,
      ...totals,
      count,
      hasAlcohol,
      unavailableCount,
      items,
      config: tenant.config,
      promo,
    };
  }, [items, promo, tenant, tip]);
}
