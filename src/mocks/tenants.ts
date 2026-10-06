import { Store, Tenant, TenantConfig } from '@/types';

/**
 * Valores de ejemplo. Las franjas de venta de alcohol varían por comunidad
 * autónoma y municipio: el backend real debe devolver las vigentes.
 */
const base: TenantConfig = {
  deliveryFee: 2.49,
  serviceFee: 0.59,
  minOrder: 6,
  freeDeliveryThreshold: 25,
  etaMin: 15,
  etaMax: 30,
  alcohol: { enabled: true, allowedFrom: '08:00', allowedTo: '22:00', minAge: 18 },
  paymentMethods: ['card', 'apple_pay', 'google_pay', 'bizum'],
  features: { tips: true, scheduledOrders: true, pickup: false, supportChat: true },
};

const cfg = (over: Partial<TenantConfig> = {}): TenantConfig => ({
  ...base,
  ...over,
  alcohol: { ...base.alcohol, ...(over.alcohol ?? {}) },
  features: { ...base.features, ...(over.features ?? {}) },
});

export const tenants: Tenant[] = [
  { id: 't-mad', name: 'Madrid', slug: 'madrid', timezone: 'Europe/Madrid', center: { latitude: 40.4168, longitude: -3.7038 }, config: cfg({ deliveryFee: 2.99, freeDeliveryThreshold: 30 }) },
  { id: 't-bcn', name: 'Barcelona', slug: 'barcelona', timezone: 'Europe/Madrid', center: { latitude: 41.3874, longitude: 2.1686 }, config: cfg({ deliveryFee: 2.99, alcohol: { enabled: true, allowedFrom: '08:00', allowedTo: '23:00', minAge: 18 } }) },
  { id: 't-vlc', name: 'Valencia', slug: 'valencia', timezone: 'Europe/Madrid', center: { latitude: 39.4699, longitude: -0.3763 }, config: cfg() },
  { id: 't-svq', name: 'Sevilla', slug: 'sevilla', timezone: 'Europe/Madrid', center: { latitude: 37.3891, longitude: -5.9845 }, config: cfg({ etaMin: 20, etaMax: 35 }) },
  { id: 't-agp', name: 'Málaga', slug: 'malaga', timezone: 'Europe/Madrid', center: { latitude: 36.7213, longitude: -4.4214 }, config: cfg() },
  { id: 't-ali', name: 'Alicante', slug: 'alicante', timezone: 'Europe/Madrid', center: { latitude: 38.3452, longitude: -0.481 }, config: cfg({ deliveryFee: 1.99, minOrder: 5 }) },
  { id: 't-bio', name: 'Bilbao', slug: 'bilbao', timezone: 'Europe/Madrid', center: { latitude: 43.263, longitude: -2.935 }, config: cfg({ features: { tips: true, scheduledOrders: false, pickup: false, supportChat: true } }) },
  { id: 't-zaz', name: 'Zaragoza', slug: 'zaragoza', timezone: 'Europe/Madrid', center: { latitude: 41.6488, longitude: -0.8891 }, config: cfg({ deliveryFee: 1.99 }) },
];

const s = (
  id: string,
  tenantId: string,
  name: string,
  address: string,
  latitude: number,
  longitude: number,
  status: Store['status'] = 'open',
  coverageRadiusKm = 3.5,
  prepMinutes = 6,
): Store => ({ id, tenantId, name, address, location: { latitude, longitude }, status, coverageRadiusKm, prepMinutes });

export const stores: Store[] = [
  s('s-mad-sol', 't-mad', '1pavo Sol', 'C/ del Carmen, 12', 40.4178, -3.7045),
  s('s-mad-mal', 't-mad', '1pavo Malasaña', 'C/ Fuencarral, 88', 40.4262, -3.7021, 'busy'),
  s('s-mad-sal', 't-mad', '1pavo Salamanca', 'C/ Goya, 41', 40.4245, -3.6778),
  s('s-mad-cha', 't-mad', '1pavo Chamberí', 'C/ Santa Engracia, 60', 40.4352, -3.7003),
  s('s-bcn-gra', 't-bcn', '1pavo Gràcia', 'C/ Gran de Gràcia, 120', 41.4012, 2.1538),
  s('s-bcn-rav', 't-bcn', '1pavo Raval', 'C/ de Joaquín Costa, 9', 41.3834, 2.1656),
  s('s-bcn-eix', 't-bcn', '1pavo Eixample', 'C/ de Aragó, 255', 41.3925, 2.1621),
  s('s-vlc-rus', 't-vlc', '1pavo Russafa', 'C/ de Sueca, 30', 39.4613, -0.3741),
  s('s-vlc-ben', 't-vlc', '1pavo Benimaclet', 'C/ Emilio Baró, 17', 39.4859, -0.3585),
  s('s-vlc-cen', 't-vlc', '1pavo Centro', 'C/ de la Paz, 5', 39.4735, -0.3757),
  s('s-svq-tri', 't-svq', '1pavo Triana', 'C/ San Jacinto, 44', 37.3833, -6.0033),
  s('s-svq-ala', 't-svq', '1pavo Alameda', 'Alameda de Hércules, 70', 37.3995, -5.9934),
  s('s-agp-cen', 't-agp', '1pavo Centro', 'C/ Carretería, 22', 36.7236, -4.4252),
  s('s-agp-pla', 't-agp', '1pavo La Malagueta', 'Paseo de Reding, 8', 36.7208, -4.4088),
  s('s-ali-cen', 't-ali', '1pavo Centro', 'Av. Alfonso X el Sabio, 15', 38.3468, -0.4855),
  s('s-ali-pla', 't-ali', '1pavo San Juan', 'Av. de Niza, 40', 38.3695, -0.4262, 'open', 3),
  s('s-bio-cas', 't-bio', '1pavo Casco Viejo', 'C/ Somera, 11', 43.2574, -2.9234),
  s('s-bio-ind', 't-bio', '1pavo Indautxu', 'C/ Alameda Urquijo, 50', 43.2618, -2.9408),
  s('s-zaz-cen', 't-zaz', '1pavo Centro', 'C/ Alfonso I, 20', 41.6538, -0.8805),
  s('s-zaz-del', 't-zaz', '1pavo Delicias', 'Av. de Madrid, 110', 41.6445, -0.9102, 'open', 3),
];

tenants.forEach((t) => (t.storeCount = stores.filter((st) => st.tenantId === t.id).length));
