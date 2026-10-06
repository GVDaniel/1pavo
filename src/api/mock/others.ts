import { promosFor } from '@/mocks/promos';
import { formatPrice } from '@/utils/format';
import { ApiError } from '../errors';
import { AuthRepository, NotificationRepository, PromoRepository } from '../repositories';
import { db } from './db';
import { mock } from './util';

const session = (phone?: string) => ({
  token: `mock-token-${Date.now()}`,
  user: { ...db.user, phone: phone ?? db.user.phone },
});

export const mockAuth: AuthRepository = {
  requestOtp: () => mock(() => ({ expiresIn: 30 })),
  verifyOtp: (phone, code) =>
    mock(() => {
      if (code === '000000') throw new ApiError('OTP_INVALID', 'El código no es correcto.');
      return session(phone);
    }),
  loginWithEmail: (_email, password) =>
    mock(() => {
      if (password.length < 6) throw new ApiError('BAD_CREDENTIALS', 'Email o contraseña incorrectos.');
      return session();
    }),
  loginWithProvider: () => mock(() => session()),
  deleteAccount: () => mock(() => undefined),
};

export const mockPromos: PromoRepository = {
  list: (tenantId) => mock(() => promosFor(tenantId)),
  validate: (tenantId, code, subtotal) =>
    mock(() => {
      const promo = promosFor(tenantId).find((p) => p.code === code.trim().toUpperCase());
      if (!promo) throw new ApiError('PROMO_NOT_FOUND', 'Este código no existe o ha caducado.');
      if (subtotal < promo.minOrder) {
        throw new ApiError('PROMO_MIN', `Este código necesita un pedido de ${formatPrice(promo.minOrder)} o más.`);
      }
      const h = new Date().getHours();
      if (promo.code === 'NOCHE' && h >= 6) {
        throw new ApiError('PROMO_HOURS', 'Este código solo funciona de 00:00 a 6:00.');
      }
      return promo;
    }),
};

export const mockNotificationsRepo: NotificationRepository = {
  list: () => mock(() => db.notifications),
  markAllRead: () =>
    mock(() => {
      db.notifications.forEach((n) => (n.read = true));
    }),
};
