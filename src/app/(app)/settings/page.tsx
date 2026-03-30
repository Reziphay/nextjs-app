'use client';

import { useRouter } from 'next/navigation';

import { useT } from '@/lib/app/i18n/context';
import { useActiveRole } from '@/lib/app/stores/auth.store';
import {
  LANGUAGE_LABELS,
  type AppLanguage,
  type ThemeMode,
  useSettingsStore,
} from '@/lib/app/stores/settings.store';
import { cn } from '@/lib/utils/cn';

const THEME_OPTIONS: Array<{
  value: ThemeMode;
  labelKey: 'settingsThemeSystem' | 'settingsThemeLight' | 'settingsThemeDark';
}> = [
  { value: 'system', labelKey: 'settingsThemeSystem' },
  { value: 'light', labelKey: 'settingsThemeLight' },
  { value: 'dark', labelKey: 'settingsThemeDark' },
];

const LANGUAGES: AppLanguage[] = ['az', 'en', 'ru', 'tr'];
const REMINDER_OPTIONS = [5, 10, 15, 30, 60];

export default function SettingsPage() {
  const t = useT();
  const router = useRouter();
  const role = useActiveRole();
  const {
    themeMode,
    language,
    reminderEnabled,
    reminderMinutes,
    setThemeMode,
    setLanguage,
    setReminderEnabled,
    setReminderMinutes,
  } = useSettingsStore();

  const backHref = role === 'USO' ? '/uso/profile' : '/ucr/profile';

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--app-bg)]">
      <div className="pointer-events-none absolute right-[-6rem] top-[-4rem] h-60 w-60 rounded-full bg-[var(--rz-ucr-primary-soft)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-5rem] left-[-7rem] h-72 w-72 rounded-full bg-[var(--rz-uso-primary-soft)] blur-3xl" />

      <div className="mx-auto max-w-2xl px-4 pt-6 pb-10">
        <div className="mb-6 flex items-center gap-3 rounded-[22px] border border-[var(--app-border)] bg-[var(--app-base-bg)] px-4 py-3 shadow-[var(--app-shadow)]">
          <button
            onClick={() => router.push(backHref)}
            className="text-[var(--app-ink-muted)] transition hover:text-[var(--app-primary)]"
          >
            ← {t.commonBack}
          </button>
          <div>
            <h1 className="text-xl font-semibold tracking-[-0.02em] text-[var(--app-ink)]">
              {t.settingsTitle}
            </h1>
            <p className="text-xs text-[var(--app-ink-faint)]">{t.settingsAppearance}</p>
          </div>
        </div>

        <div className="space-y-6">
          <SettingsSection title={t.settingsAppearance}>
            <SettingsRow label={t.settingsTheme}>
              <OptionGroup>
                {THEME_OPTIONS.map(({ value, labelKey }) => (
                  <OptionChip
                    key={value}
                    active={themeMode === value}
                    onClick={() => setThemeMode(value)}
                  >
                    {t[labelKey]}
                  </OptionChip>
                ))}
              </OptionGroup>
            </SettingsRow>

            <SettingsRow label={t.settingsLanguage}>
              <OptionGroup>
                {LANGUAGES.map((lang) => (
                  <OptionChip
                    key={lang}
                    active={language === lang}
                    onClick={() => setLanguage(lang)}
                  >
                    {LANGUAGE_LABELS[lang]}
                  </OptionChip>
                ))}
              </OptionGroup>
            </SettingsRow>
          </SettingsSection>

          <SettingsSection title={t.settingsReminders}>
            <SettingsRow label={t.settingsReminderEnabled}>
              <button
                onClick={() => setReminderEnabled(!reminderEnabled)}
                className={cn(
                  'relative h-7 w-12 rounded-full transition-colors',
                  reminderEnabled ? 'bg-[var(--app-primary)]' : 'bg-[var(--app-border)]',
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform',
                    reminderEnabled ? 'translate-x-6' : 'translate-x-1',
                  )}
                />
              </button>
            </SettingsRow>

            {reminderEnabled ? (
              <SettingsRow label={t.settingsReminderMinutes}>
                <OptionGroup>
                  {REMINDER_OPTIONS.map((min) => (
                    <OptionChip
                      key={min}
                      active={reminderMinutes === min}
                      onClick={() => setReminderMinutes(min)}
                    >
                      {min}m
                    </OptionChip>
                  ))}
                </OptionGroup>
              </SettingsRow>
            ) : null}
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--app-ink-faint)]">
        {title}
      </h2>
      <div className="overflow-hidden rounded-[24px] border border-[var(--app-border)] bg-[var(--app-base-bg)] shadow-[var(--app-shadow)]">
        {children}
      </div>
    </section>
  );
}

function SettingsRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-[var(--app-divider)] px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-medium text-[var(--app-ink)]">{label}</span>
      <div className="sm:max-w-[60%] sm:justify-end">{children}</div>
    </div>
  );
}

function OptionGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2 sm:justify-end">{children}</div>;
}

function OptionChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
        active
          ? 'border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]'
          : 'border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-ink-muted)] hover:border-[var(--app-primary-light)] hover:text-[var(--app-ink)]',
      )}
    >
      {children}
    </button>
  );
}
