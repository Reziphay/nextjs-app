'use client';

import { create } from 'zustand';

import { tokenStore } from '../api/client';
import type { User, AppRole } from '../models/user';

export type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated';

type AuthState = {
  status: AuthStatus;
  user: User | null;

  // Actions
  setAuthenticated: (user: User) => void;
  updateUser: (user: User) => void;
  setUnauthenticated: () => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  status: 'unknown',
  user: null,

  setAuthenticated: (user) => set({ status: 'authenticated', user }),
  updateUser: (user) => set({ user }),
  setUnauthenticated: () => {
    tokenStore.clear();
    set({ status: 'unauthenticated', user: null });
  },
}));

// ─── Selectors ────────────────────────────────────────────────────────────────

export const useCurrentUser = () => useAuthStore((s) => s.user);
export const useAuthStatus = () => useAuthStore((s) => s.status);
export const useIsAuthenticated = () => useAuthStore((s) => s.status === 'authenticated');
export const useActiveRole = (): AppRole | null =>
  useAuthStore((s) => s.user?.activeRole ?? null);
export const useIsUcr = () => useAuthStore((s) => s.user?.activeRole === 'UCR');
export const useIsUso = () => useAuthStore((s) => s.user?.activeRole === 'USO');
