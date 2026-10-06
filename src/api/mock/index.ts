import { Repositories } from '../repositories';
import { mockCatalog } from './catalog';
import { mockOrders } from './orders';
import { mockAuth, mockNotificationsRepo, mockPromos } from './others';
import { mockTenant } from './tenant';
import { mockUserRepo } from './user';

export const mockRepositories: Repositories = {
  auth: mockAuth,
  tenant: mockTenant,
  catalog: mockCatalog,
  orders: mockOrders,
  user: mockUserRepo,
  promos: mockPromos,
  notifications: mockNotificationsRepo,
};
