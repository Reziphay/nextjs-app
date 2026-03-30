'use client';

import { useRouter } from 'next/navigation';
import { useT } from '@/lib/app/i18n/context';
import { useSettingsStore, LANGUAGE_LABELS, type ThemeMode, type AppLanguage } from '@/lib/app/stores/settings.store';
import { useActiveRole } from '@/lib/app/stores/auth.store';
import { cn } from '@/lib/utils/cn';

const THEME_OPTIONS: { value: ThemeMode; labelKey: 'settingsThemeSystem' | 'settingsThemeLight' | 'settingsThemeDark' }[] = [
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
    <div className="max-w-lg mx-auto w-full px-4 pt-6 pb-8">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.push(backHref)} className="text-[var(--app-ink-muted)] hover:text-[var(--app-primary)]">
          ← {t.commonBack}
        </button>
        <h1 className="text-xl font-bold text-[var(--app-ink)]">{t.settingsTitle}</h1>
      </div>

      {/* Appearance section */}
      <SettingsSection title={t.settingsAppearance}>
        <SettingsRow label={t.settingsTheme}>
          <div className="flex gap-1">
            {THEME_OPTIONS.map(({ value, labelKey }) => (
              <button
                key={value}
                onClick={() => setThemeMode(value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  themeMode === value
                    ? 'bg-[var(--app-primary)] text-white'
                    : 'bg-[var(--app-card)] border border-[var(--app-border)] text-[var(--app-ink-muted)]',
                )}
              >
                {t[labelKey]}
              </button>
            ))}
          </div>
        </SettingsRow>

        <SettingsRow label={t.settingsLanguage}>
          <div className="flex gap-1 flex-wrap justify-end">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  language === lang
                    ? 'bg-[var(--app-primary)] text-white'
                    : 'bg-[var(--app-card)] border border-[var(--app-border)] text-[var(--app-ink-muted)]',
                )}
              >
                {LANGUAGE_LABELS[lang]}
              </button>
            ))}
          </div>
        </SettingsRow>
      </SettingsSection>

      {/* Reminders section */}
      <SettingsSection title={t.settingsReminders}>
        <SettingsRow label={t.settingsReminderEnabled}>
          <button
            onClick={() => setReminderEnabled(!reminderEnabled)}
            className={cn(
              'w-11 h-6 rounded-full transition-colors relative',
              reminderEnabled ? 'bg-[var(--app-primary)]' : 'bg-[var(--app-border)]',
            )}
          >
            <span
              className={cn(
                'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform',
                reminderEnabled ? 'translate-x-6' : 'translate-x-1',
              )}
            />
          </button>
        </SettingsRow>

        {reminderEnabled && (
          <SettingsRow label={t.settingsReminderMinutes}>
            <div className="flex gap-1 flex-wrap justify-end">
              {REMINDER_OPTIONS.map((min) => (
                <button
                  key={min}
                  onClick={() => setReminderMinutes(min)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    reminderMinutes === min
                      ? 'bg-[var(--app-primary)] text-white'
                      : 'bg-[var(--app-card)] border border-[var(--app-border)] text-[var(--app-ink-muted)]',
                  )}
                >
                  {min}
                </button>
              ))}
            </div>
          </SettingsRow>
        )}
      </SettingsSection>
    </div>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-xs font-semibold text-[var(--app-ink-faint)] uppercase tracking-wider mb-3 px-1">
        {title}
      </h2>
      <div className="bg-[var(--app-card)] rounded-2xl border border-[var(--app-border)] divide-y divide-[var(--app-divider)]">
        {children}
      </div>
    </div>
  );
}

function SettingsRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
      <span className="text-sm text-[var(--app-ink)]">{label}</span>
      <div className="flex items-center">{children}</div>
    </div>
  );
}
