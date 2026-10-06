import {
  Address,
  AppNotification,
  AuthSession,
  Banner,
  Category,
  CreateOrderInput,
  Daypart,
  HomeFeed,
  LatLng,
  LocationResolution,
  Order,
  PaymentMethod,
  ProductFilter,
  Promo,
  Store,
  StoreProduct,
  Tenant,
  User,
} from '@/types';

/**
 * Contratos de datos. Las pantallas nunca llaman a esto directamente:
 * usan los hooks de src/hooks/queries.ts.
 */
export interface AuthRepository {
  requestOtp(phone: string): Promise<{ expiresIn: number }>;
  verifyOtp(phone: string, code: string): Promise<AuthSession>;
  loginWithEmail(email: string, password: string): Promise<AuthSession>;
  loginWithProvider(provider: 'apple' | 'google'): Promise<AuthSession>;
  deleteAccount(): Promise<void>;
}

export interface TenantRepository {
  list(): Promise<Tenant[]>;
  get(id: string): Promise<Tenant>;
  listStores(tenantId: string): Promise<Store[]>;
  resolveByLocation(location: LatLng): Promise<LocationResolution>;
  notifyCoverage(location: LatLng, email?: string): Promise<void>;
}

export interface CatalogRepository {
  listCategories(): Promise<Category[]>;
  listProducts(filter: ProductFilter): Promise<StoreProduct[]>;
  getProduct(storeId: string, id: string): Promise<StoreProduct>;
  getRelated(storeId: string, id: string): Promise<StoreProduct[]>;
  getHomeFeed(tenantId: string, storeId: string, daypart: Daypart): Promise<HomeFeed>;
  getBanners(tenantId: string): Promise<Banner[]>;
  trendingSearches(tenantId: string): Promise<string[]>;
}

export interface OrderRepository {
  list(): Promise<Order[]>;
  get(id: string): Promise<Order>;
  create(input: CreateOrderInput): Promise<Order>;
  rate(id: string, rating: NonNullable<Order['rating']> & { tip?: number }): Promise<Order>;
}

export interface UserRepository {
  me(): Promise<User>;
  update(data: Partial<User>): Promise<User>;
  listAddresses(): Promise<Address[]>;
  addAddress(a: Omit<Address, 'id'>): Promise<Address>;
  removeAddress(id: string): Promise<void>;
  setDefaultAddress(id: string): Promise<void>;
  listPaymentMethods(): Promise<PaymentMethod[]>;
  addCard(card: { number: string; expiry: string; cvc: string; holder: string }): Promise<PaymentMethod>;
  removePaymentMethod(id: string): Promise<void>;
}

export interface PromoRepository {
  list(tenantId: string): Promise<Promo[]>;
  validate(tenantId: string, code: string, subtotal: number): Promise<Promo>;
}

export interface NotificationRepository {
  list(): Promise<AppNotification[]>;
  markAllRead(): Promise<void>;
}

export interface Repositories {
  auth: AuthRepository;
  tenant: TenantRepository;
  catalog: CatalogRepository;
  orders: OrderRepository;
  user: UserRepository;
  promos: PromoRepository;
  notifications: NotificationRepository;
}
