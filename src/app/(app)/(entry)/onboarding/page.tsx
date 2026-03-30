'use client';

import { useRouter } from 'next/navigation';

import { EntryFlowPanel } from '@/components/app/entry-flow-panel';
import { useT } from '@/lib/app/i18n/context';
import type { AppRole } from '@/lib/app/models/user';

const ROLES: Array<{
  role: AppRole;
  titleKey: 'onboardingCustomer' | 'onboardingProvider';
  descKey: 'onboardingCustomerDesc' | 'onboardingProviderDesc';
}> = [
  { role: 'UCR', titleKey: 'onboardingCustomer', descKey: 'onboardingCustomerDesc' },
  { role: 'USO', titleKey: 'onboardingProvider', descKey: 'onboardingProviderDesc' },
];

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

export default function OnboardingPage() {
  const t = useT();
  const router = useRouter();

  function handleSelectRole(role: AppRole) {
    sessionStorage.setItem('rzp_onboard_role', role);
    router.push('/auth/phone');
  }

  return (
    <EntryFlowPanel
      align="center"
      title={t.onboardingTitle}
      subtitle={t.onboardingSubtitle}
      bodyClassName="space-y-3"
    >
      {ROLES.map(({ role, titleKey, descKey }) => {
        const { accent, soft } = ROLE_ACCENTS[role];

        return (
          <button
            key={role}
            type="button"
            onClick={() => handleSelectRole(role)}
            className="group flex w-full items-center gap-4 rounded-[20px] border border-[var(--app-border)] bg-[var(--app-card)] px-5 py-4 text-left shadow-[0_12px_28px_rgba(15,15,18,0.04)] transition-transform hover:-translate-y-0.5"
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
              <span className="mt-1 block text-[13px] leading-6 text-[var(--app-ink-muted)]">
                {t[descKey]}
              </span>
            </span>

            <span className="text-[var(--app-ink-faint)] transition-colors group-hover:text-[var(--app-ink-muted)]">
              <ChevronRightIcon />
            </span>
          </button>
        );
      })}
    </EntryFlowPanel>
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

function CustomerIcon() {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.2" fill="currentColor" />
      <path
        d="M6.25 18.25c.65-2.7 2.55-4.25 5.75-4.25s5.1 1.55 5.75 4.25"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
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
