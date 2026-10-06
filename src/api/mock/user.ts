import { Address, PaymentMethod } from '@/types';
import { ApiError } from '../errors';
import { UserRepository } from '../repositories';
import { db } from './db';
import { mock } from './util';

const brandOf = (n: string): PaymentMethod['brand'] =>
  n.startsWith('4') ? 'visa' : n.startsWith('3') ? 'amex' : 'mastercard';

export const mockUserRepo: UserRepository = {
  me: () => mock(() => db.user),
  update: (data) => mock(() => Object.assign(db.user, data)),
  listAddresses: () => mock(() => db.addresses),
  addAddress: (a) =>
    mock(() => {
      const address: Address = { ...a, id: `a-${Date.now()}` };
      if (address.isDefault) db.addresses.forEach((x) => (x.isDefault = false));
      db.addresses.push(address);
      return address;
    }),
  removeAddress: (id) =>
    mock(() => {
      db.addresses = db.addresses.filter((a) => a.id !== id);
    }),
  setDefaultAddress: (id) =>
    mock(() => {
      db.addresses.forEach((a) => (a.isDefault = a.id === id));
    }),
  listPaymentMethods: () => mock(() => db.payments),
  addCard: (card) =>
    mock(() => {
      const digits = card.number.replace(/\s/g, '');
      if (digits.endsWith('0000')) throw new ApiError('CARD_DECLINED', 'El banco ha rechazado la tarjeta.');
      const brand = brandOf(digits);
      const pm: PaymentMethod = {
        id: `pm-${Date.now()}`,
        type: 'card',
        brand,
        label: brand === 'visa' ? 'Visa' : brand === 'amex' ? 'American Express' : 'Mastercard',
        last4: digits.slice(-4),
        expiry: card.expiry,
        isDefault: db.payments.length === 0,
      };
      db.payments.push(pm);
      return pm;
    }),
  removePaymentMethod: (id) =>
    mock(() => {
      db.payments = db.payments.filter((p) => p.id !== id);
    }),
};
