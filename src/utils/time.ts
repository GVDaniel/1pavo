import { AlcoholRules, Daypart } from '@/types';

export function getDaypart(date = new Date()): Daypart {
  const h = date.getHours();
  if (h >= 6 && h < 12) return 'morning';
  if (h >= 12 && h < 20) return 'afternoon';
  if (h >= 20 || h < 1) return 'night';
  return 'late';
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** ¿Está la fecha dentro de la franja? Soporta franjas que cruzan medianoche. */
export function isWithinHours(from: string, to: string, date = new Date()) {
  const now = date.getHours() * 60 + date.getMinutes();
  const a = toMinutes(from);
  const b = toMinutes(to);
  return a <= b ? now >= a && now < b : now >= a || now < b;
}

export function canSellAlcohol(rules: AlcoholRules, date = new Date()) {
  return rules.enabled && isWithinHours(rules.allowedFrom, rules.allowedTo, date);
}

/** Genera franjas de entrega programada cada 30 min */
export function buildSlots(count = 8, from = new Date()) {
  const start = new Date(from);
  start.setMinutes(start.getMinutes() < 30 ? 30 : 60, 0, 0);
  start.setMinutes(start.getMinutes() + 30);
  return Array.from({ length: count }, (_, i) => new Date(start.getTime() + i * 30 * 60_000));
}
