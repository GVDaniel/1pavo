const currency = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

export const formatPrice = (value: number) => currency.format(value);

/** Divide un precio en parte entera y céntimos para la etiqueta tipo pegatina */
export function splitPrice(value: number) {
  const [int, dec] = value.toFixed(2).split('.');
  return { int, dec };
}

export const formatTime = (iso: string | Date) => {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

export const formatDistance = (km: number) =>
  km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace('.', ',')} km`;

export const discountPct = (price: number, oldPrice?: number) =>
  oldPrice && oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0;

/** Normaliza para búsquedas: minúsculas y sin tildes */
export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const initials = (first: string, last?: string) =>
  `${first.charAt(0)}${last?.charAt(0) ?? ''}`.toUpperCase();
