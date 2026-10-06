/**
 * Implementación HTTP de los repositorios.
 * TODO(backend): ajusta rutas y payloads a tu API real. Las pantallas no cambian.
 * Headers de tenant (X-Tenant-Id, X-Store-Id) y token se inyectan en api/client.ts.
 */
import {
  Address,
  AppNotification,
  AuthSession,
  Banner,
  Category,
  HomeFeed,
  LocationResolution,
  Order,
  PaymentMethod,
  Promo,
  Store,
  StoreProduct,
  Tenant,
  User,
} from '@/types';
import { http } from '../client';
import { Repositories } from '../repositories';

export const httpRepositories: Repositories = {
  auth: {
    requestOtp: (phone) => http.post('/auth/otp', { phone }),
    verifyOtp: (phone, code) => http.post<AuthSession>('/auth/otp/verify', { phone, code }),
    loginWithEmail: (email, password) => http.post<AuthSession>('/auth/login', { email, password }),
    loginWithProvider: (provider) => http.post<AuthSession>(`/auth/${provider}`), // TODO: enviar idToken del proveedor
    deleteAccount: () => http.delete('/me'),
  },
  tenant: {
    list: () => http.get<Tenant[]>('/tenants'),
    get: (id) => http.get<Tenant>(`/tenants/${id}`),
    listStores: (tenantId) => http.get<Store[]>(`/tenants/${tenantId}/stores`),
    resolveByLocation: (loc) =>
      http.get<LocationResolution>('/tenants/resolve', { lat: loc.latitude, lng: loc.longitude }),
    notifyCoverage: (loc, email) =>
      http.post('/coverage/waitlist', { lat: loc.latitude, lng: loc.longitude, email }),
  },
  catalog: {
    listCategories: () => http.get<Category[]>('/categories'),
    listProducts: (f) =>
      http.get<StoreProduct[]>(`/stores/${f.storeId}/products`, {
        category: f.categoryId,
        subcategory: f.subcategoryId,
        q: f.query,
        tags: f.tags?.join(','),
        ids: f.ids?.join(','),
        sort: f.sort,
        limit: f.limit,
      }),
    getProduct: (storeId, id) => http.get<StoreProduct>(`/stores/${storeId}/products/${id}`),
    getRelated: (storeId, id) => http.get<StoreProduct[]>(`/stores/${storeId}/products/${id}/related`),
    getHomeFeed: (tenantId, storeId, daypart) =>
      http.get<HomeFeed>(`/stores/${storeId}/home`, { tenant: tenantId, daypart }),
    getBanners: (tenantId) => http.get<Banner[]>(`/tenants/${tenantId}/banners`),
    trendingSearches: (tenantId) => http.get<string[]>(`/tenants/${tenantId}/trending-searches`),
  },
  orders: {
    list: () => http.get<Order[]>('/orders'),
    get: (id) => http.get<Order>(`/orders/${id}`),
    create: (input) => http.post<Order>('/orders', input),
    rate: (id, rating) => http.post<Order>(`/orders/${id}/rating`, rating),
  },
  user: {
    me: () => http.get<User>('/me'),
    update: (data) => http.patch<User>('/me', data),
    listAddresses: () => http.get<Address[]>('/me/addresses'),
    addAddress: (a) => http.post<Address>('/me/addresses', a),
    removeAddress: (id) => http.delete(`/me/addresses/${id}`),
    setDefaultAddress: (id) => http.post(`/me/addresses/${id}/default`),
    listPaymentMethods: () => http.get<PaymentMethod[]>('/me/payment-methods'),
    // TODO: en producción tokeniza la tarjeta con tu pasarela (Stripe, Redsys…) y envía solo el token.
    addCard: (card) => http.post<PaymentMethod>('/me/payment-methods', card),
    removePaymentMethod: (id) => http.delete(`/me/payment-methods/${id}`),
  },
  promos: {
    list: (tenantId) => http.get<Promo[]>(`/tenants/${tenantId}/promos`),
    validate: (tenantId, code, subtotal) =>
      http.post<Promo>(`/tenants/${tenantId}/promos/validate`, { code, subtotal }),
  },
  notifications: {
    list: () => http.get<AppNotification[]>('/me/notifications'),
    markAllRead: () => http.post('/me/notifications/read-all'),
  },
};
