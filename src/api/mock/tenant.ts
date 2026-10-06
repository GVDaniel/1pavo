import { stores, tenants } from '@/mocks/tenants';
import { distanceKm } from '@/utils/geo';
import { ApiError } from '../errors';
import { TenantRepository } from '../repositories';
import { mock } from './util';

/** Radio máximo para considerar que una ubicación pertenece a una ciudad */
const CITY_RADIUS_KM = 35;

export const mockTenant: TenantRepository = {
  list: () => mock(() => tenants),
  get: (id) =>
    mock(() => {
      const t = tenants.find((x) => x.id === id);
      if (!t) throw new ApiError('NOT_FOUND', 'Ciudad no encontrada');
      return t;
    }),
  listStores: (tenantId) => mock(() => stores.filter((s) => s.tenantId === tenantId)),
  resolveByLocation: (loc) =>
    mock(() => {
      const nearestTenant = tenants
        .map((t) => ({ t, d: distanceKm(loc, t.center) }))
        .sort((a, b) => a.d - b.d)[0];
      if (!nearestTenant || nearestTenant.d > CITY_RADIUS_KM) return { tenant: null, store: null };
      const store =
        stores
          .filter((s) => s.tenantId === nearestTenant.t.id && s.status !== 'closed')
          .map((s) => ({ s, d: distanceKm(loc, s.location) }))
          .filter(({ s, d }) => d <= s.coverageRadiusKm)
          .sort((a, b) => a.d - b.d)[0]?.s ?? null;
      return { tenant: nearestTenant.t, store };
    }),
  notifyCoverage: () => mock(() => undefined),
};
