'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { AppRole } from '@/lib/app/models/user';
import { useT } from '@/lib/app/i18n/context';
import {
  LANGUAGE_LABELS,
  type AppLanguage,
  type ThemeMode,
  useSettingsStore,
} from '@/lib/app/stores/settings.store';
import { cn } from '@/lib/utils/cn';

const ROLES: Array<{
  role: AppRole;
  titleKey: 'onboardingCustomer' | 'onboardingProvider';
  descKey: 'onboardingCustomerDesc' | 'onboardingProviderDesc';
}> = [
  { role: 'UCR', titleKey: 'onboardingCustomer', descKey: 'onboardingCustomerDesc' },
  { role: 'USO', titleKey: 'onboardingProvider', descKey: 'onboardingProviderDesc' },
];

const LANGUAGES: AppLanguage[] = ['az', 'en', 'ru', 'tr'];
const ROLE_ACCENTS: Record<AppRole, { accent: string; soft: string }> = {
  UCR: {
    accent: 'var(--rz-ucr-primary)',
    soft: 'var(--rz-ucr-primary-soft)',
  },
  USO: {
    accent: 'var(--rz-uso-primary)',
    soft: 'var(--rz-uso-primary-soft)',
  },
};

function getNextThemeMode(mode: ThemeMode): ThemeMode {
  if (mode === 'system') return 'light';
  if (mode === 'light') return 'dark';
  return 'system';
}

export default function OnboardingPage() {
  const t = useT();
  const router = useRouter();
  const { language, setLanguage, setThemeMode, themeMode } = useSettingsStore();
  const [languageOpen, setLanguageOpen] = useState(false);
  const languageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!languageRef.current?.contains(event.target as Node)) {
        setLanguageOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  function handleSelectRole(role: AppRole) {
    sessionStorage.setItem('rzp_onboard_role', role);
    router.push('/auth/phone');
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--app-base-bg)] px-6 py-8">
      <div className="pointer-events-none absolute right-[-6rem] top-[-4rem] h-[18rem] w-[18rem] rounded-full bg-[var(--rz-ucr-primary-soft)] blur-3xl" />
      <div className="pointer-events-none absolute left-[-6rem] top-[28%] h-[10rem] w-[10rem] rounded-full bg-[var(--rz-ucr-primary-soft)] blur-2xl" />
      <div className="pointer-events-none absolute bottom-[6%] left-[-8rem] h-[22rem] w-[22rem] rounded-full bg-[var(--rz-uso-primary-soft)] blur-3xl" />

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[420px] flex-col">
        <div className="flex items-start justify-end gap-2">
          <div ref={languageRef} className="relative">
            <button
              type="button"
              onClick={() => setLanguageOpen((open) => !open)}
              className="flex h-9 items-center gap-1 rounded-full border border-[var(--app-border)] bg-[var(--app-bg)] px-3 text-[13px] font-semibold text-[var(--app-ink)] shadow-[0_4px_14px_rgba(15,15,18,0.04)]"
            >
              <span>{language.toUpperCase()}</span>
              <ChevronDownIcon open={languageOpen} />
            </button>

            {languageOpen ? (
              <div className="absolute right-0 z-20 mt-2 w-40 rounded-[18px] border border-[var(--app-border)] bg-[var(--app-card)] p-1.5 shadow-[var(--app-shadow)]">
                {LANGUAGES.map((lang) => {
                  const selected = lang === language;

                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        setLanguage(lang);
                        setLanguageOpen(false);
                      }}
                      className={cn(
                        'flex w-full items-center justify-between rounded-[14px] px-3 py-2 text-sm transition-colors',
                        selected
                          ? 'bg-[var(--app-primary-soft)] text-[var(--app-primary)]'
                          : 'text-[var(--app-ink)] hover:bg-[var(--app-bg)]',
                      )}
                    >
                      <span>{LANGUAGE_LABELS[lang]}</span>
                      {selected ? <span className="text-xs font-semibold">✓</span> : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setThemeMode(getNextThemeMode(themeMode))}
            className="grid h-9 w-9 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-ink)] shadow-[0_4px_14px_rgba(15,15,18,0.04)]"
            aria-label={`Theme mode: ${themeMode}`}
          >
            <ThemeModeIcon mode={themeMode} />
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-center py-8">
          <div className="text-center">
            <h1 className="text-[44px] font-bold tracking-[-0.05em] text-[var(--app-ink)] sm:text-[52px]">
              Reziphay.
            </h1>
            <p className="mt-3 text-base text-[var(--app-ink-muted)]">{t.appTagline}</p>
          </div>

          <div className="mt-24">
            <p className="text-center text-sm font-medium text-[var(--app-ink-muted)]">
              {t.onboardingSubtitle}
            </p>

            <div className="mt-4 space-y-3">
              {ROLES.map(({ role, titleKey, descKey }) => {
                const { accent, soft } = ROLE_ACCENTS[role];

                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleSelectRole(role)}
                    className="group flex w-full items-center gap-4 rounded-[18px] border border-[var(--app-border)] bg-[var(--app-card)] px-5 py-4 text-left shadow-[0_12px_28px_rgba(15,15,18,0.04)] transition-transform hover:-translate-y-0.5"
                  >
                    <span
                      className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full"
                      style={{ backgroundColor: soft, color: accent }}
                    >
                      {role === 'UCR' ? <CustomerIcon /> : <ProviderIcon />}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-[17px] font-semibold text-[var(--app-ink)]">
                        {t[titleKey]}
                      </span>
                      <span className="mt-1 block text-[13px] text-[var(--app-ink-muted)]">
                        {t[descKey]}
                      </span>
                    </span>

                    <span className="text-[var(--app-ink-faint)] transition-colors group-hover:text-[var(--app-ink-muted)]">
                      <ChevronRightIcon />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={cn('transition-transform', open ? 'rotate-180' : '')}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
    >
      <path
        d="M3.5 5.25 7 8.75l3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="m8 5 5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ThemeModeIcon({ mode }: { mode: ThemeMode }) {
  if (mode === 'light') {
    return (
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 1.75v2M9 14.25v2M16.25 9h-2M3.75 9h-2M14.13 3.87l-1.41 1.41M5.28 12.72l-1.41 1.41M14.13 14.13l-1.41-1.41M5.28 5.28 3.87 3.87" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (mode === 'dark') {
    return (
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M11.93 2.26a6.75 6.75 0 1 0 3.81 11.48A7.5 7.5 0 0 1 11.93 2.26Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M5 12.5 9 4l4 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.2 10h5.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="13.75" cy="4.25" r="1.25" fill="currentColor" />
    </svg>
  );
}

function CustomerIcon() {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.2" fill="currentColor" />
      <path d="M6.25 18.25c.65-2.7 2.55-4.25 5.75-4.25s5.1 1.55 5.75 4.25" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function ProviderIcon() {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="4.25" y="7.25" width="15.5" height="11.5" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 7.25V6.5A2.5 2.5 0 0 1 11.5 4h1A2.5 2.5 0 0 1 15 6.5v.75" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.25 11.25h15.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
