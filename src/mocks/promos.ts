import { Banner, Promo } from '@/types';

const inDays = (d: number) => new Date(Date.now() + d * 86_400_000).toISOString();

export const promosFor = (tenantId: string): Promo[] => [
  { id: `${tenantId}-bienvenida`, code: 'BIENVENIDA', title: '20 % en tu primer pedido', description: 'Descuento del 20 % en pedidos desde 10 €.', type: 'percent', value: 20, minOrder: 10, expiresAt: inDays(30) },
  { id: `${tenantId}-noche`, code: 'NOCHE', title: 'Envío gratis de madrugada', description: 'Sin gastos de envío en pedidos entre las 00:00 y las 6:00.', type: 'free_delivery', value: 0, minOrder: 8, expiresAt: inDays(14) },
  { id: `${tenantId}-unpavo`, code: '1PAVO', title: '1 € de descuento', description: 'Te regalamos un pavo en pedidos desde 8 €.', type: 'fixed', value: 1, minOrder: 8, expiresAt: inDays(7) },
];

export const bannersFor = (cityName: string): Banner[] => [
  { id: 'b-1', title: `${cityName} no duerme.\nNosotros tampoco.`, subtitle: 'Tu tienda abierta las 24 horas, en tu puerta en minutos.', cta: 'Pedir ahora', emoji: '🌙', background: '#141726', foreground: '#FFD60A' },
  { id: 'b-2', title: 'Hielo, vasos\ny refrescos', subtitle: 'Todo para la previa, sin salir de casa.', cta: 'Ver bebidas', emoji: '🧊', background: '#3BA7FF', foreground: '#FFFFFF', target: { type: 'category', id: 'bebidas' } },
  { id: 'b-3', title: '20 % en tu\nprimer pedido', subtitle: 'Con el código BIENVENIDA desde 10 €.', cta: 'Ver cupones', emoji: '🎁', background: '#FF3D71', foreground: '#FFFFFF', target: { type: 'promo', code: 'BIENVENIDA' } },
];

export const trendingSearches = ['hielo', 'pan', 'cerveza', 'patatas', 'helado', 'pilas', 'chuches', 'agua'];

export const couriers = [
  { name: 'Andrés', vehicle: 'moto' as const, phone: '+34 600 111 222', rating: 4.9 },
  { name: 'Sara', vehicle: 'bici' as const, phone: '+34 600 333 444', rating: 4.8 },
  { name: 'Iván', vehicle: 'patinete' as const, phone: '+34 600 555 666', rating: 4.7 },
];
