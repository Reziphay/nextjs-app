'use client';

import { useEffect, useRef, useState } from 'react';

import {
  LANGUAGE_LABELS,
  type AppLanguage,
  type ThemeMode,
  useSettingsStore,
} from '@/lib/app/stores/settings.store';
import { cn } from '@/lib/utils/cn';

const LANGUAGES: AppLanguage[] = ['az', 'en', 'ru', 'tr'];

function getNextThemeMode(mode: ThemeMode): ThemeMode {
  if (mode === 'system') return 'light';
  if (mode === 'light') return 'dark';
  return 'system';
}

type LanguageThemeControlsProps = {
  className?: string;
  dropdownSide?: 'left' | 'right';
};

export function LanguageThemeControls({
  className,
  dropdownSide = 'right',
}: LanguageThemeControlsProps) {
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

  return (
    <div className={cn('flex items-start gap-2', className)}>
      <div ref={languageRef} className="relative">
        <button
          type="button"
          onClick={() => setLanguageOpen((open) => !open)}
          className="flex h-10 items-center gap-1 rounded-full border border-[var(--app-border)] bg-[var(--app-card)] px-3 text-[13px] font-semibold text-[var(--app-ink)] shadow-[0_4px_14px_rgba(15,15,18,0.04)]"
        >
          <span>{language.toUpperCase()}</span>
          <ChevronDownIcon open={languageOpen} />
        </button>

        {languageOpen ? (
          <div
            className={cn(
              'absolute z-20 mt-2 w-40 rounded-[18px] border border-[var(--app-border)] bg-[var(--app-card)] p-1.5 shadow-[var(--app-shadow)]',
              dropdownSide === 'left' ? 'left-0' : 'right-0',
            )}
          >
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
        className="grid h-10 w-10 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-ink)] shadow-[0_4px_14px_rgba(15,15,18,0.04)]"
        aria-label={`Theme mode: ${themeMode}`}
      >
        <ThemeModeIcon mode={themeMode} />
      </button>
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

function ThemeModeIcon({ mode }: { mode: ThemeMode }) {
  if (mode === 'light') {
    return (
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M9 1.75v2M9 14.25v2M16.25 9h-2M3.75 9h-2M14.13 3.87l-1.41 1.41M5.28 12.72l-1.41 1.41M14.13 14.13l-1.41-1.41M5.28 5.28 3.87 3.87"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
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
      <path
        d="M5 12.5 9 4l4 8.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6.2 10h5.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="13.75" cy="4.25" r="1.25" fill="currentColor" />
    </svg>
  );
}
