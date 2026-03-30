'use client';

import type { ReactNode } from 'react';

import { LanguageThemeControls } from '@/components/shared/language-theme-controls';
import { ReziphayLogo } from '@/components/shared/reziphay-logo';
import { useT } from '@/lib/app/i18n/context';

export function EntryFlowShell({ children }: { children: ReactNode }) {
  const t = useT();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--app-base-bg)] px-6 py-8">
      <div className="pointer-events-none absolute right-[-6rem] top-[-4rem] h-[18rem] w-[18rem] rounded-full bg-[var(--rz-ucr-primary-soft)] blur-3xl" />
      <div className="pointer-events-none absolute left-[-6rem] top-[28%] h-[10rem] w-[10rem] rounded-full bg-[var(--rz-ucr-primary-soft)] blur-2xl" />
      <div className="pointer-events-none absolute bottom-[6%] left-[-8rem] h-[22rem] w-[22rem] rounded-full bg-[var(--rz-uso-primary-soft)] blur-3xl" />

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[440px] flex-col">
        <LanguageThemeControls className="justify-end" />

        <div className="flex flex-1 flex-col justify-center py-8">
          <div className="text-center">
            <ReziphayLogo
              size={88}
              priority
              className="mx-auto rounded-[28px] shadow-[0_18px_36px_rgba(15,15,18,0.08)]"
            />
            <p className="mt-3 text-base text-[var(--app-ink-muted)]">{t.appTagline}</p>
          </div>

          <div className="mt-16">{children}</div>
        </div>
      </div>
    </div>
  );
}
