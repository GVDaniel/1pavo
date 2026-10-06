import { env } from '@/config/env';
import { httpRepositories } from './http';
import { mockRepositories } from './mock';
import { Repositories } from './repositories';

/** Punto único de acceso a datos. Cambia EXPO_PUBLIC_USE_MOCKS para alternar. */
export const repos: Repositories = env.useMocks ? mockRepositories : httpRepositories;

export { ApiError } from './errors';
