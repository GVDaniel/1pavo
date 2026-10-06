import { env } from '@/config/env';
import { useAuthStore } from '@/store/authStore';
import { useTenantStore } from '@/store/tenantStore';
import { ApiError } from './errors';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type Query = Record<string, string | number | boolean | undefined | null>;

function buildUrl(path: string, query?: Query) {
  const base = env.apiUrl.replace(/\/$/, '');
  const qs = query
    ? Object.entries(query)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&')
    : '';
  return `${base}${path}${qs ? `?${qs}` : ''}`;
}

/**
 * Cliente HTTP único. Inyecta:
 *  - Authorization: Bearer <token>
 *  - X-Tenant-Id / X-Store-Id (multitenancy)
 */
export async function request<T>(method: Method, path: string, opts: { body?: unknown; query?: Query } = {}) {
  const { token } = useAuthStore.getState();
  const { tenantId, storeId } = useTenantStore.getState();

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Accept-Language': 'es-ES',
  };
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  if (tenantId) headers['X-Tenant-Id'] = tenantId;
  if (storeId) headers['X-Store-Id'] = storeId;

  let res: Response;
  try {
    res = await fetch(buildUrl(path, opts.query), {
      method,
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new ApiError('NETWORK', 'No hay conexión. Revisa tu red e inténtalo de nuevo.');
  }

  if (res.status === 401) useAuthStore.getState().logout();

  if (!res.ok) {
    let body: { code?: string; message?: string } | undefined;
    try {
      body = await res.json();
    } catch {
      body = undefined;
    }
    throw new ApiError(body?.code ?? `HTTP_${res.status}`, body?.message ?? res.statusText, res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const http = {
  get: <T>(path: string, query?: Query) => request<T>('GET', path, { query }),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, { body }),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, { body }),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, { body }),
  delete: <T>(path: string) => request<T>('DELETE', path),
};
