import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage } from './storage';

export type ThemeMode = 'auto-night' | 'light' | 'dark' | 'system';
export type Language = 'es' | 'ca' | 'gl' | 'eu' | 'en';

interface PrefsState {
  themeMode: ThemeMode;
  language: Language;
  recentSearches: string[];
  notifications: { orders: boolean; promos: boolean; news: boolean };
  setThemeMode: (m: ThemeMode) => void;
  setLanguage: (l: Language) => void;
  addRecentSearch: (q: string) => void;
  clearRecentSearches: () => void;
  setNotification: (key: keyof PrefsState['notifications'], value: boolean) => void;
}

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      themeMode: 'auto-night',
      language: 'es',
      recentSearches: [],
      notifications: { orders: true, promos: true, news: false },
      setThemeMode: (themeMode) => set({ themeMode }),
      setLanguage: (language) => set({ language }),
      addRecentSearch: (q) =>
        set((s) => {
          const clean = q.trim();
          if (!clean) return s;
          return { recentSearches: [clean, ...s.recentSearches.filter((x) => x !== clean)].slice(0, 8) };
        }),
      clearRecentSearches: () => set({ recentSearches: [] }),
      setNotification: (key, value) => set((s) => ({ notifications: { ...s.notifications, [key]: value } })),
    }),
    { name: '1pavo-prefs', storage: persistStorage },
  ),
);
