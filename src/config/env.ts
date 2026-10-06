function resolveApiUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL;
  if (configured && !configured.includes('api.1pavo.es')) return configured.replace(/\/$/, '');
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return `${window.location.protocol}//${window.location.hostname}:8000/api`;
  }
  return 'http://127.0.0.1:8000/api';
}

export const env = {
  apiUrl: resolveApiUrl(),
  /** Cambia a false en .env para usar el backend real */
  useMocks: (process.env.EXPO_PUBLIC_USE_MOCKS ?? 'false') === 'true',
  mockLatency: [300, 800] as const,
  mockErrorRate: Number(process.env.EXPO_PUBLIC_MOCK_ERROR_RATE ?? '0'),
  /** Ubicación de demo para probar en simulador (Puerta del Sol, Madrid) */
  demoLocation: { latitude: 40.4169, longitude: -3.7035 },
};
