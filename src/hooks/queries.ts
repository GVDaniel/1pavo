import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { repos } from '@/api';
import { useAuthStore } from '@/store/authStore';
import { useTenantStore } from '@/store/tenantStore';
import { Address, CreateOrderInput, Order, ProductFilter } from '@/types';
import { getDaypart } from '@/utils/time';

export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 60_000 } },
});

const useStoreId = () => useTenantStore((s) => s.storeId);
const useTenantId = () => useTenantStore((s) => s.tenantId);

/* ── Tenant ─────────────────────────────── */
export const useTenants = () => useQuery({ queryKey: ['tenants'], queryFn: () => repos.tenant.list() });

export function useCurrentTenant() {
  const id = useTenantId();
  return useQuery({ queryKey: ['tenant', id], queryFn: () => repos.tenant.get(id!), enabled: !!id });
}

export function useCurrentStore() {
  const tenantId = useTenantId();
  const storeId = useStoreId();
  return useQuery({
    queryKey: ['stores', tenantId],
    queryFn: () => repos.tenant.listStores(tenantId!),
    enabled: !!tenantId,
    select: (list) => list.find((s) => s.id === storeId),
  });
}

/* ── Catálogo ───────────────────────────── */
export const useCategories = () =>
  useQuery({ queryKey: ['categories'], queryFn: () => repos.catalog.listCategories(), staleTime: Infinity });

export function useProducts(filter: Omit<ProductFilter, 'storeId'>, enabled = true) {
  const storeId = useStoreId();
  return useQuery({
    queryKey: ['products', storeId, filter],
    queryFn: () => repos.catalog.listProducts({ ...filter, storeId: storeId! }),
    enabled: !!storeId && enabled,
    placeholderData: (prev) => prev,
  });
}

export function useProduct(id?: string) {
  const storeId = useStoreId();
  return useQuery({
    queryKey: ['product', storeId, id],
    queryFn: () => repos.catalog.getProduct(storeId!, id!),
    enabled: !!storeId && !!id,
  });
}

export function useRelated(id?: string) {
  const storeId = useStoreId();
  return useQuery({
    queryKey: ['related', storeId, id],
    queryFn: () => repos.catalog.getRelated(storeId!, id!),
    enabled: !!storeId && !!id,
  });
}

export function useHomeFeed() {
  const storeId = useStoreId();
  const tenantId = useTenantId();
  const daypart = getDaypart();
  return useQuery({
    queryKey: ['home', tenantId, storeId, daypart],
    queryFn: () => repos.catalog.getHomeFeed(tenantId!, storeId!, daypart),
    enabled: !!storeId && !!tenantId,
  });
}

export function useTrendingSearches() {
  const tenantId = useTenantId();
  return useQuery({
    queryKey: ['trending', tenantId],
    queryFn: () => repos.catalog.trendingSearches(tenantId!),
    enabled: !!tenantId,
  });
}

/* ── Pedidos ────────────────────────────── */
const isLive = (o?: Order) => !!o && o.status !== 'delivered' && o.status !== 'cancelled';

export function useOrders() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => repos.orders.list(),
    enabled: !!token,
    refetchInterval: (q) => (q.state.data?.some(isLive) ? 4000 : false),
  });
}

/** Con `live` hace polling mientras el pedido está en curso (sustituible por WebSocket/SSE) */
export function useOrder(id?: string, live = false) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => repos.orders.get(id!),
    enabled: !!id,
    refetchInterval: (q) => (live && isLive(q.state.data) ? 2000 : false),
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrderInput) => repos.orders.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export function useRateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; delivery: number; products: number; comment?: string; tip?: number }) =>
      repos.orders.rate(p.id, p),
    onSuccess: (o) => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.setQueryData(['order', o.id], o);
    },
  });
}

/* ── Usuario ────────────────────────────── */
export function useAddresses() {
  const token = useAuthStore((s) => s.token);
  return useQuery({ queryKey: ['addresses'], queryFn: () => repos.user.listAddresses(), enabled: !!token });
}

export function useAddAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (a: Omit<Address, 'id'>) => repos.user.addAddress(a),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['addresses'] }),
  });
}

export function useRemoveAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => repos.user.removeAddress(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['addresses'] }),
  });
}

export function useSetDefaultAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => repos.user.setDefaultAddress(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['addresses'] }),
  });
}

export function usePaymentMethods() {
  const token = useAuthStore((s) => s.token);
  return useQuery({ queryKey: ['payments'], queryFn: () => repos.user.listPaymentMethods(), enabled: !!token });
}

export function useAddCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (c: { number: string; expiry: string; cvc: string; holder: string }) => repos.user.addCard(c),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payments'] }),
  });
}

export function useRemovePaymentMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => repos.user.removePaymentMethod(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payments'] }),
  });
}

/* ── Promos y notificaciones ────────────── */
export function usePromos() {
  const tenantId = useTenantId();
  return useQuery({ queryKey: ['promos', tenantId], queryFn: () => repos.promos.list(tenantId!), enabled: !!tenantId });
}

export function useValidatePromo() {
  const tenantId = useTenantId();
  return useMutation({
    mutationFn: (p: { code: string; subtotal: number }) => repos.promos.validate(tenantId!, p.code, p.subtotal),
  });
}

export function useNotifications() {
  const token = useAuthStore((s) => s.token);
  return useQuery({ queryKey: ['notifications'], queryFn: () => repos.notifications.list(), enabled: !!token });
}
