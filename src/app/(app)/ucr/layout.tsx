'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

import { useAuthStore } from '@/lib/app/stores/auth.store';
import { useT } from '@/lib/app/i18n/context';
import { cn } from '@/lib/utils/cn';

const NAV_ITEMS = [
  { href: '/ucr/explore', labelKey: 'navExplore' as const, icon: '🏠' },
  { href: '/ucr/reservations', labelKey: 'navReservations' as const, icon: '📅' },
  { href: '/ucr/notifications', labelKey: 'navNotifications' as const, icon: '🔔' },
  { href: '/ucr/profile', labelKey: 'navProfile' as const, icon: '👤' },
];

export default function UcrLayout({ children }: { children: ReactNode }) {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const status = useAuthStore((s) => s.status);
  const activeRole = useAuthStore((s) => s.user?.activeRole);

  // Route guard — wait for bootstrap, then redirect if needed
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/onboarding');
      return;
    }
    if (status === 'authenticated' && activeRole === 'USO') {
      router.replace('/uso/incoming');
    }
  }, [status, activeRole, router]);

  if (status === 'unknown') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--app-bg)]">
        <div className="w-6 h-6 rounded-full border-2 border-[var(--app-primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (status !== 'authenticated') return null;

  return (
    <div className="flex min-h-screen bg-[var(--app-bg)]">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-[var(--app-border)] bg-[var(--app-card)] py-8 px-4">
        <div className="px-3 mb-8">
          <h1 className="text-xl font-bold text-[var(--app-ink)]">Reziphay</h1>
          <p className="text-xs text-[var(--app-ink-faint)] mt-0.5">UCR</p>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, labelKey, icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  active
                    ? 'bg-[var(--app-primary-soft)] text-[var(--app-primary)]'
                    : 'text-[var(--app-ink-muted)] hover:bg-[var(--app-primary-soft)] hover:text-[var(--app-primary)]',
                )}
              >
                <span className="text-base">{icon}</span>
                {t[labelKey]}
              </Link>
            );
          })}
        </nav>
        {/* Settings link */}
        <div className="mt-auto">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--app-ink-muted)] hover:bg-[var(--app-primary-soft)] hover:text-[var(--app-primary)] transition-colors"
          >
            <span>⚙️</span>
            {t.settingsTitle}
          </Link>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto pb-20 lg:pb-0">
        {children}
      </main>

      {/* ── Mobile bottom navigation ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--app-card)] border-t border-[var(--app-border)] flex z-40 safe-area-pb">
        {NAV_ITEMS.map(({ href, labelKey, icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors',
                active ? 'text-[var(--app-primary)]' : 'text-[var(--app-ink-faint)]',
              )}
            >
              <span className="text-xl leading-none">{icon}</span>
              <span className="font-medium">{t[labelKey]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
