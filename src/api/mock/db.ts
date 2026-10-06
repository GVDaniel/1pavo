import { mockAddresses, mockNotifications, mockPayments, mockUser } from '@/mocks/user';
import { products } from '@/mocks/products';
import { stores } from '@/mocks/tenants';
import { Address, AppNotification, Order, OrderItem, PaymentMethod, User } from '@/types';

/** "Base de datos" en memoria del backend simulado */
export const db = {
  user: { ...mockUser } as User,
  addresses: [...mockAddresses] as Address[],
  payments: [...mockPayments] as PaymentMethod[],
  notifications: [...mockNotifications] as AppNotification[],
  orders: [] as Order[],
  liveOrderIds: new Set<string>(),
};

const pick = (ids: [string, number][]): OrderItem[] =>
  ids.map(([id, quantity]) => {
    const p = products.find((x) => x.id === id)!;
    return { productId: p.id, name: p.name, emoji: p.emoji, format: p.format, quantity, unitPrice: p.basePrice };
  });

const sol = stores.find((s) => s.id === 's-mad-sol')!;
const history: [string, [string, number][], number, Order['status']][] = [
  ['4821', [['p-bebidas-1', 4], ['p-snacks-1', 2], ['p-congelados-3', 1]], 1, 'delivered'],
  ['4710', [['p-panaderia-1', 2], ['p-panaderia-4', 3], ['p-lacteos-1', 1]], 3, 'delivered'],
  ['4655', [['p-helados-2', 1], ['p-chuches-1', 2]], 6, 'delivered'],
  ['4593', [['p-emergencias-3', 1], ['p-bebidas-9', 2]], 9, 'cancelled'],
  ['4488', [['p-listo-5', 1], ['p-bebidas-6', 2], ['p-chuches-5', 1]], 14, 'delivered'],
  ['4390', [['p-drogueria-1', 1], ['p-higiene-1', 1], ['p-parafarmacia-1', 1]], 21, 'delivered'],
];

db.orders = history.map(([code, items, daysAgo, status]) => {
  const created = new Date(Date.now() - daysAgo * 86_400_000 - 3 * 3_600_000);
  const its = pick(items);
  const subtotal = Math.round(its.reduce((n, i) => n + i.unitPrice * i.quantity, 0) * 100) / 100;
  const deliveryFee = subtotal >= 30 ? 0 : 2.99;
  return {
    id: `o-${code}`,
    code: `1P-${code}`,
    tenantId: 't-mad',
    storeId: sol.id,
    storeName: sol.name,
    storeLocation: sol.location,
    items: its,
    status,
    createdAt: created.toISOString(),
    etaAt: new Date(created.getTime() + 25 * 60_000).toISOString(),
    deliveredAt: status === 'delivered' ? new Date(created.getTime() + 22 * 60_000).toISOString() : undefined,
    address: { label: 'Casa', street: mockAddresses[0].street, location: mockAddresses[0].location, addressId: 'a-1' },
    paymentLabel: 'Visa ···· 4242',
    totals: {
      subtotal,
      deliveryFee,
      serviceFee: 0.59,
      discount: 0,
      tip: 1,
      total: Math.round((subtotal + deliveryFee + 0.59 + 1) * 100) / 100,
    },
    courier: { name: 'Sara', vehicle: 'bici', phone: '+34 600 333 444', rating: 4.8 },
  } satisfies Order;
});
