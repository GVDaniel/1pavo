import { computeTotals } from '@/features/cart/pricing';
import { products } from '@/mocks/products';
import { couriers, promosFor } from '@/mocks/promos';
import { stores, tenants } from '@/mocks/tenants';
import { useTenantStore } from '@/store/tenantStore';
import { Order, OrderStatus } from '@/types';
import { interpolate } from '@/utils/geo';
import { canSellAlcohol } from '@/utils/time';
import { ApiError } from '../errors';
import { OrderRepository } from '../repositories';
import { toStoreProduct } from './catalog';
import { db } from './db';
import { mock } from './util';

/** Fases de la simulación en segundos desde la creación del pedido */
const PHASES = { preparing: 12, onTheWay: 30, delivered: 80 };

function live(o: Order): Order {
  if (!db.liveOrderIds.has(o.id) || o.status === 'delivered' || o.status === 'cancelled') return o;
  const start = o.scheduledFor ? new Date(o.scheduledFor).getTime() - 10 * 60_000 : new Date(o.createdAt).getTime();
  const elapsed = (Date.now() - start) / 1000;
  let status: OrderStatus = 'received';
  if (elapsed >= PHASES.preparing) status = 'preparing';
  if (elapsed >= PHASES.onTheWay) status = 'on_the_way';
  if (elapsed >= PHASES.delivered) status = 'delivered';

  const next: Order = { ...o, status };
  if (status === 'on_the_way' && o.courier) {
    const t = (elapsed - PHASES.onTheWay) / (PHASES.delivered - PHASES.onTheWay);
    next.courier = { ...o.courier, location: interpolate(o.storeLocation, o.address.location, t) };
  }
  if (status === 'delivered') {
    next.deliveredAt = new Date().toISOString();
    next.courier = o.courier ? { ...o.courier, location: o.address.location } : undefined;
    Object.assign(o, next); // se congela en "entregado"
    db.liveOrderIds.delete(o.id);
  }
  return next;
}

const paymentLabel = (id: string) => {
  if (id === 'apple_pay') return 'Apple Pay';
  if (id === 'google_pay') return 'Google Pay';
  if (id === 'bizum') return 'Bizum';
  const pm = db.payments.find((p) => p.id === id);
  return pm ? `${pm.label} ···· ${pm.last4}` : 'Tarjeta';
};

export const mockOrders: OrderRepository = {
  list: () =>
    mock(() =>
      db.orders.map(live).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    ),

  get: (id) =>
    mock(() => {
      const o = db.orders.find((x) => x.id === id);
      if (!o) throw new ApiError('NOT_FOUND', 'No encontramos este pedido.');
      return live(o);
    }),

  create: (input) =>
    mock(() => {
      // El backend real obtiene la tienda del header X-Store-Id; aquí la leemos del store.
      const storeId = useTenantStore.getState().storeId;
      const store = stores.find((s) => s.id === storeId) ?? stores[0];
      const tenant = tenants.find((t) => t.id === store.tenantId)!;
      const lines = input.items.map((i) => {
        const p = products.find((x) => x.id === i.productId);
        if (!p) throw new ApiError('PRODUCT_NOT_FOUND', 'Un producto de tu cesta ya no existe.');
        return { sp: toStoreProduct(p, store.id), quantity: i.quantity };
      });
      const hasAlcohol = lines.some((l) => l.sp.ageRestricted);
      const when = input.scheduledFor ? new Date(input.scheduledFor) : new Date();
      if (hasAlcohol && !canSellAlcohol(tenant.config.alcohol, when)) {
        throw new ApiError('ALCOHOL_NOT_ALLOWED', 'A esta hora no se puede vender alcohol en tu ciudad.');
      }
      if (hasAlcohol && !input.ageVerified) {
        throw new ApiError('AGE_NOT_VERIFIED', 'Confirma que eres mayor de edad para continuar.');
      }
      const subtotal = lines.reduce((n, l) => n + l.sp.price * l.quantity, 0);
      const promo = input.promoCode
        ? promosFor(tenant.id).find((p) => p.code === input.promoCode) ?? null
        : null;
      const totals = computeTotals({ subtotal, config: tenant.config, promo, tip: input.tip });
      if (!totals.meetsMinimum) throw new ApiError('MIN_ORDER', 'No llegas al pedido mínimo.');

      const now = Date.now();
      const code = String(5000 + Math.floor(Math.random() * 4000));
      const courier = couriers[Math.floor(Math.random() * couriers.length)];
      const order: Order = {
        id: `o-${code}-${now}`,
        code: `1P-${code}`,
        tenantId: tenant.id,
        storeId: store.id,
        storeName: store.name,
        storeLocation: store.location,
        items: lines.map((l) => ({
          productId: l.sp.id,
          name: l.sp.name,
          emoji: l.sp.emoji,
          format: l.sp.format,
          quantity: l.quantity,
          unitPrice: l.sp.price,
        })),
        status: 'received',
        createdAt: new Date(now).toISOString(),
        scheduledFor: input.scheduledFor,
        etaAt: new Date((input.scheduledFor ? +new Date(input.scheduledFor) : now) + tenant.config.etaMax * 60_000).toISOString(),
        address: input.address,
        instructions: input.instructions,
        paymentLabel: paymentLabel(input.paymentMethodId),
        promoCode: totals.promoValid ? input.promoCode : undefined,
        totals: {
          subtotal: totals.subtotal,
          deliveryFee: totals.deliveryFee,
          serviceFee: totals.serviceFee,
          discount: totals.discount,
          tip: totals.tip,
          total: totals.total,
        },
        courier,
      };
      db.orders.unshift(order);
      db.liveOrderIds.add(order.id);
      return order;
    }),

  rate: (id, rating) =>
    mock(() => {
      const o = db.orders.find((x) => x.id === id);
      if (!o) throw new ApiError('NOT_FOUND', 'No encontramos este pedido.');
      o.rating = { delivery: rating.delivery, products: rating.products, comment: rating.comment };
      if (rating.tip) {
        o.totals.tip += rating.tip;
        o.totals.total += rating.tip;
      }
      return o;
    }),
};
