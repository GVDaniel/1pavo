export type ID = string;
export type LatLng = { latitude: number; longitude: number };

export type PaymentMethodType = 'card' | 'apple_pay' | 'google_pay' | 'bizum';

export interface AlcoholRules {
  /** Si la ciudad permite vender alcohol por la app */
  enabled: boolean;
  /** Franja permitida en hora local, formato HH:mm. Puede cruzar medianoche. */
  allowedFrom: string;
  allowedTo: string;
  minAge: number;
}

export interface TenantConfig {
  deliveryFee: number;
  serviceFee: number;
  minOrder: number;
  freeDeliveryThreshold: number;
  etaMin: number;
  etaMax: number;
  alcohol: AlcoholRules;
  paymentMethods: PaymentMethodType[];
  features: {
    tips: boolean;
    scheduledOrders: boolean;
    pickup: boolean;
    supportChat: boolean;
  };
}

/** Tenant = ciudad */
export interface Tenant {
  id: ID;
  name: string;
  slug: string;
  center: LatLng;
  timezone: string;
  storeCount?: number;
  config: TenantConfig;
}

export type StoreStatus = 'open' | 'busy' | 'closed';

export interface Store {
  id: ID;
  tenantId: ID;
  name: string;
  address: string;
  location: LatLng;
  coverageRadiusKm: number;
  status: StoreStatus;
  prepMinutes: number;
}

export interface Subcategory {
  id: ID;
  name: string;
}

export interface Category {
  id: ID;
  name: string;
  emoji: string;
  /** Color base (hex 6) que se tinta según el tema */
  hue: string;
  ageRestricted?: boolean;
  subcategories: Subcategory[];
}

export type ProductTag =
  | 'oferta'
  | 'nuevo'
  | 'frio'
  | 'vegano'
  | 'sin_gluten'
  | 'recien_hecho'
  | 'mas18';

export interface Nutrition {
  kcal: number;
  fat: number;
  carbs: number;
  sugar: number;
  protein: number;
  salt: number;
}

export interface Product {
  id: ID;
  name: string;
  format: string;
  description: string;
  categoryId: ID;
  subcategoryId: ID;
  emoji: string;
  /** URL real de imagen (opcional; si no hay se usa el emoji) */
  image?: string;
  tags: ProductTag[];
  ageRestricted: boolean;
  basePrice: number;
  baseOldPrice?: number;
  nutrition?: Nutrition;
  allergens?: string[];
  popularity: number;
}

/** Producto con precio y stock de una tienda concreta */
export interface StoreProduct extends Product {
  storeId: ID;
  price: number;
  oldPrice?: number;
  stock: number;
  available: boolean;
}

export type ProductSort = 'relevance' | 'price_asc' | 'price_desc' | 'offers';

export interface ProductFilter {
  storeId: ID;
  categoryId?: ID;
  subcategoryId?: ID;
  query?: string;
  tags?: ProductTag[];
  ids?: ID[];
  sort?: ProductSort;
  limit?: number;
}

export interface CartItem {
  productId: ID;
  quantity: number;
  product: StoreProduct;
  unavailable?: boolean;
}

export interface Address {
  id: ID;
  label: string;
  street: string;
  details?: string;
  postalCode: string;
  city: string;
  location: LatLng;
  instructions?: string;
  isDefault: boolean;
}

export interface DeliveryLocation {
  label: string;
  street: string;
  location: LatLng;
  addressId?: ID;
}

export interface PaymentMethod {
  id: ID;
  type: PaymentMethodType;
  label: string;
  brand?: 'visa' | 'mastercard' | 'amex';
  last4?: string;
  expiry?: string;
  isDefault: boolean;
}

export type OrderStatus = 'received' | 'preparing' | 'on_the_way' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: ID;
  name: string;
  emoji: string;
  format: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderTotals {
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  discount: number;
  tip: number;
  total: number;
}

export interface Courier {
  name: string;
  vehicle: 'bici' | 'moto' | 'patinete';
  phone: string;
  rating: number;
  location?: LatLng;
}

export interface Order {
  id: ID;
  code: string;
  tenantId: ID;
  storeId: ID;
  storeName: string;
  storeLocation: LatLng;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string;
  scheduledFor?: string;
  etaAt: string;
  deliveredAt?: string;
  address: DeliveryLocation;
  instructions?: string;
  paymentLabel: string;
  promoCode?: string;
  /** Codigo de 4 cifras que el cliente enseña al repartidor */
  deliveryCode?: string | null;
  totals: OrderTotals;
  courier?: Courier;
  rating?: { delivery: number; products: number; comment?: string };
}

export interface CreateOrderInput {
  items: { productId: ID; quantity: number }[];
  address: DeliveryLocation;
  instructions?: string;
  paymentMethodId: ID;
  tip: number;
  promoCode?: string;
  scheduledFor?: string;
  ageVerified: boolean;
}

export interface User {
  id: ID;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate?: string;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface Banner {
  id: ID;
  title: string;
  subtitle: string;
  cta: string;
  emoji: string;
  background: string;
  foreground: string;
  target?: { type: 'category'; id: ID } | { type: 'promo'; code: string };
}

export type PromoType = 'percent' | 'fixed' | 'free_delivery';

export interface Promo {
  id: ID;
  code: string;
  title: string;
  description: string;
  type: PromoType;
  value: number;
  minOrder: number;
  expiresAt: string;
}

export interface AppNotification {
  id: ID;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  kind: 'order' | 'promo' | 'info';
}

export type Daypart = 'morning' | 'afternoon' | 'night' | 'late';

export interface HomeFeed {
  banners: Banner[];
  flashDeals: StoreProduct[];
  flashEndsAt: string;
  forNow: StoreProduct[];
  popular: StoreProduct[];
  daypart: Daypart;
}

export interface LocationResolution {
  tenant: Tenant | null;
  store: Store | null;
}
