'use client';

import { useEffect, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { I18nProvider } from '@/lib/app/i18n/context';
import { useAuthStore } from '@/lib/app/stores/auth.store';
import { useSettingsStore } from '@/lib/app/stores/settings.store';
import { authService } from '@/lib/app/services/auth.service';
import { applyPaletteToRoot, getPalette } from '@/lib/app/theme/palette';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

// ─── Bootstrap: validate session + apply theme on mount ──────────────────────

function AppBootstrap() {
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const setUnauthenticated = useAuthStore((s) => s.setUnauthenticated);
  const activeRole = useAuthStore((s) => s.user?.activeRole ?? null);
  const themeMode = useSettingsStore((s) => s.themeMode);

  useEffect(() => {
    authService.validateSession().then((user) => {
      if (user) setAuthenticated(user);
      else setUnauthenticated();
    });
  }, [setAuthenticated, setUnauthenticated]);

  // Apply role-aware palette to CSS variables
  useEffect(() => {
    applyPaletteToRoot(getPalette(activeRole));
  }, [activeRole]);

  // Apply theme mode (light / dark / system)
  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else if (themeMode === 'light') {
      root.classList.remove('dark');
    } else {
      // system
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      if (mq.matches) root.classList.add('dark');
      else root.classList.remove('dark');

      const handler = (e: MediaQueryListEvent) => {
        if (e.matches) root.classList.add('dark');
        else root.classList.remove('dark');
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [themeMode]);

  return null;
}

// ─── Root provider ────────────────────────────────────────────────────────────

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AppBootstrap />
        {children}
      </I18nProvider>
    </QueryClientProvider>
  );
}
