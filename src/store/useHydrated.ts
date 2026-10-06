import { useEffect, useState } from 'react';
import { useAuthStore } from './authStore';
import { useCartStore } from './cartStore';
import { usePrefsStore } from './prefsStore';
import { useTenantStore } from './tenantStore';

const persisted = [useAuthStore, useTenantStore, useCartStore, usePrefsStore];
const allHydrated = () => persisted.every((s) => s.persist.hasHydrated());

/** true cuando todos los stores persistidos se han cargado de AsyncStorage */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(allHydrated);
  useEffect(() => {
    const unsubs = persisted.map((s) => s.persist.onFinishHydration(() => setHydrated(allHydrated())));
    setHydrated(allHydrated());
    return () => unsubs.forEach((u) => u());
  }, []);
  return hydrated;
}
