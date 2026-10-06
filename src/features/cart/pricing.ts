import { OrderTotals, Promo, TenantConfig } from '@/types';

const round = (n: number) => Math.round(n * 100) / 100;

/** Cálculo de totales compartido por la app y el backend mock */
export function computeTotals(p: {
  subtotal: number;
  config: TenantConfig;
  promo?: Promo | null;
  tip?: number;
}): OrderTotals & { freeDeliveryRemaining: number; meetsMinimum: boolean; promoValid: boolean } {
  const { subtotal, config, promo, tip = 0 } = p;
  const promoValid = !!promo && subtotal >= promo.minOrder;
  const freeByThreshold = subtotal >= config.freeDeliveryThreshold;
  const freeByPromo = promoValid && promo?.type === 'free_delivery';
  const deliveryFee = subtotal === 0 || freeByThreshold || freeByPromo ? 0 : config.deliveryFee;
  let discount = 0;
  if (promoValid && promo?.type === 'percent') discount = (subtotal * promo.value) / 100;
  if (promoValid && promo?.type === 'fixed') discount = Math.min(promo.value, subtotal);
  const serviceFee = subtotal === 0 ? 0 : config.serviceFee;
  return {
    subtotal: round(subtotal),
    deliveryFee: round(deliveryFee),
    serviceFee: round(serviceFee),
    discount: round(discount),
    tip: round(tip),
    total: round(Math.max(0, subtotal + deliveryFee + serviceFee - discount + tip)),
    freeDeliveryRemaining: round(Math.max(0, config.freeDeliveryThreshold - subtotal)),
    meetsMinimum: subtotal >= config.minOrder,
    promoValid,
  };
}
