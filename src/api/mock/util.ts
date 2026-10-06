import { env } from '@/config/env';
import { ApiError } from '../errors';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Simula latencia y errores ocasionales. Devuelve una copia para evitar mutaciones. */
export async function mock<T>(fn: () => T | Promise<T>): Promise<T> {
  const [min, max] = env.mockLatency;
  await sleep(min + Math.random() * (max - min));
  if (Math.random() < env.mockErrorRate) {
    throw new ApiError('MOCK_ERROR', 'No hemos podido cargar esto. Inténtalo de nuevo.');
  }
  const value = await fn();
  return value === undefined ? value : (JSON.parse(JSON.stringify(value)) as T);
}
