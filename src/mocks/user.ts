import { Address, AppNotification, PaymentMethod, User } from '@/types';

export const mockUser: User = {
  id: 'u-1',
  firstName: 'Lucía',
  lastName: 'Martín',
  email: 'lucia.martin@email.com',
  phone: '+34 612 345 678',
  birthDate: '1996-04-12',
};

export const mockAddresses: Address[] = [
  { id: 'a-1', label: 'Casa', street: 'C/ de Atocha, 27, 3º B', postalCode: '28012', city: 'Madrid', location: { latitude: 40.4135, longitude: -3.7009 }, instructions: 'Portero automático, llamar al 3B', isDefault: true },
  { id: 'a-2', label: 'Trabajo', street: 'C/ de Alcalá, 45', details: 'Planta 4', postalCode: '28014', city: 'Madrid', location: { latitude: 40.4192, longitude: -3.6965 }, isDefault: false },
];

export const mockPayments: PaymentMethod[] = [
  { id: 'pm-1', type: 'card', label: 'Visa', brand: 'visa', last4: '4242', expiry: '08/28', isDefault: true },
  { id: 'pm-2', type: 'card', label: 'Mastercard', brand: 'mastercard', last4: '5510', expiry: '02/27', isDefault: false },
];

const ago = (min: number) => new Date(Date.now() - min * 60_000).toISOString();

export const mockNotifications: AppNotification[] = [
  { id: 'n-1', kind: 'promo', title: 'Noche de peli', body: 'Palomitas y refrescos con un 20 % de descuento hasta las 2:00.', createdAt: ago(35), read: false },
  { id: 'n-2', kind: 'order', title: 'Pedido entregado', body: 'Tu pedido #1P-4821 ya está en casa. ¿Qué tal ha ido?', createdAt: ago(60 * 26), read: false },
  { id: 'n-3', kind: 'info', title: 'Nueva tienda en Chamberí', body: 'Ahora llegamos antes a tu zona.', createdAt: ago(60 * 72), read: true },
  { id: 'n-4', kind: 'promo', title: 'Envío gratis de madrugada', body: 'Usa NOCHE entre las 00:00 y las 6:00.', createdAt: ago(60 * 120), read: true },
];
