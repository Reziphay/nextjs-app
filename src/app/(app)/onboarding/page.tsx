'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useT } from '@/lib/app/i18n/context';
import { useSettingsStore, LANGUAGE_LABELS, type AppLanguage } from '@/lib/app/stores/settings.store';
import type { AppRole } from '@/lib/app/models/user';
import { cn } from '@/lib/utils/cn';

const ROLES: Array<{
  role: AppRole;
  icon: string;
  titleKey: 'onboardingCustomer' | 'onboardingProvider';
  descKey: 'onboardingCustomerDesc' | 'onboardingProviderDesc';
}> = [
  { role: 'UCR', icon: '👤', titleKey: 'onboardingCustomer', descKey: 'onboardingCustomerDesc' },
  { role: 'USO', icon: '🏪', titleKey: 'onboardingProvider', descKey: 'onboardingProviderDesc' },
];

const LANGUAGES: AppLanguage[] = ['az', 'en', 'ru', 'tr'];

export default function OnboardingPage() {
  const t = useT();
  const router = useRouter();
  const { language, setLanguage } = useSettingsStore();
  const [selectedRole, setSelectedRole] = useState<AppRole>('UCR');

  function handleContinue() {
    // Store intended role for the registration step
    sessionStorage.setItem('rzp_onboard_role', selectedRole);
    router.push('/auth/phone');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-[var(--app-bg)]">
      {/* Language picker */}
      <div className="flex gap-2 mb-10">
        {LANGUAGES.map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={cn(
              'px-3 py-1 text-sm rounded-full border transition-colors',
              language === lang
                ? 'bg-[var(--app-primary)] text-white border-[var(--app-primary)]'
                : 'border-[var(--app-border)] text-[var(--app-ink-muted)] hover:border-[var(--app-primary)]',
            )}
          >
            {LANGUAGE_LABELS[lang]}
          </button>
        ))}
      </div>

      {/* Logo / title */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-[var(--app-ink)] tracking-tight">
          {t.appName}
        </h1>
        <p className="mt-2 text-[var(--app-ink-muted)] text-sm">{t.appTagline}</p>
      </div>

      {/* Heading */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-[var(--app-ink)]">{t.onboardingTitle}</h2>
        <p className="mt-1 text-[var(--app-ink-muted)] text-sm">{t.onboardingSubtitle}</p>
      </div>

      {/* Role cards */}
      <div className="w-full max-w-sm flex flex-col gap-3 mb-8">
        {ROLES.map(({ role, icon, titleKey, descKey }) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={cn(
              'w-full text-left rounded-2xl border-2 p-5 transition-all',
              selectedRole === role
                ? 'border-[var(--app-primary)] bg-[var(--app-primary-surface)]'
                : 'border-[var(--app-border)] bg-[var(--app-card)] hover:border-[var(--app-primary-light)]',
            )}
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">{icon}</span>
              <div>
                <p className="font-semibold text-[var(--app-ink)]">{t[titleKey]}</p>
                <p className="text-sm text-[var(--app-ink-muted)] mt-0.5">{t[descKey]}</p>
              </div>
              <div className="ml-auto">
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                    selectedRole === role
                      ? 'border-[var(--app-primary)] bg-[var(--app-primary)]'
                      : 'border-[var(--app-border)]',
                  )}
                >
                  {selectedRole === role && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Continue button */}
      <button
        onClick={handleContinue}
        className="w-full max-w-sm py-3.5 rounded-2xl bg-[var(--app-primary)] text-white font-semibold text-base hover:bg-[var(--app-primary-strong)] active:scale-[0.98] transition-all"
      >
        {t.onboardingContinue}
      </button>
    </div>
  );
}
