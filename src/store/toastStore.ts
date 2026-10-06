import { create } from 'zustand';

export type ToastKind = 'info' | 'success' | 'error';

interface ToastState {
  message: string | null;
  kind: ToastKind;
  key: number;
  show: (message: string, kind?: ToastKind) => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>()((set) => ({
  message: null,
  kind: 'info',
  key: 0,
  show: (message, kind = 'info') => set((s) => ({ message, kind, key: s.key + 1 })),
  hide: () => set({ message: null }),
}));

export const toast = (message: string, kind?: ToastKind) => useToastStore.getState().show(message, kind);
