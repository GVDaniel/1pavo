import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthSession, User } from '@/types';
import { persistStorage } from './storage';

interface AuthState {
  token: string | null;
  user: User | null;
  hasOnboarded: boolean;
  setOnboarded: () => void;
  setSession: (s: AuthSession) => void;
  updateUser: (u: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hasOnboarded: false,
      setOnboarded: () => set({ hasOnboarded: true }),
      setSession: ({ token, user }) => set({ token, user }),
      updateUser: (u) => set((s) => (s.user ? { user: { ...s.user, ...u } } : s)),
      logout: () => set({ token: null, user: null }),
    }),
    { name: '1pavo-auth', storage: persistStorage },
  ),
);

export const useIsGuest = () => useAuthStore((s) => !s.token);
