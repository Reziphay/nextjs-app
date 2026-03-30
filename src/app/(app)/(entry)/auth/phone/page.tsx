'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { EntryFlowPanel } from '@/components/app/entry-flow-panel';
import { AppApiError } from '@/lib/app/api/client';
import { useT } from '@/lib/app/i18n/context';
import { authService } from '@/lib/app/services/auth.service';

const COUNTRY_CODE = '+994';
const LOCAL_PHONE_LENGTH = 9;
const PHONE_GROUPS = [2, 3, 2, 2];

function normalizeLocalPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  const localDigits = digits.startsWith('994') ? digits.slice(3) : digits;
  return localDigits.slice(0, LOCAL_PHONE_LENGTH);
}

function formatLocalPhone(value: string) {
  const digits = normalizeLocalPhone(value);
  const parts: string[] = [];
  let cursor = 0;

  for (const groupSize of PHONE_GROUPS) {
    const part = digits.slice(cursor, cursor + groupSize);
    if (!part) break;
    parts.push(part);
    cursor += groupSize;
  }

  return parts.join(' ');
}

function getLocalPlaceholder(placeholder: string) {
  return placeholder.replace(/^\+994\s*/, '').trim() || '50 123 45 67';
}

export default function PhonePage() {
  const t = useT();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = phone.length === LOCAL_PHONE_LENGTH;
  const localPlaceholder = getLocalPlaceholder(t.phoneEntryPlaceholder);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    const formattedPhone = `${COUNTRY_CODE}${phone}`;

    setLoading(true);
    setError(null);

    try {
      const res = await authService.requestOtp(formattedPhone, 'AUTHENTICATE');
      sessionStorage.setItem('rzp_otp_phone', formattedPhone);
      if (res.debugCode) {
        sessionStorage.setItem('rzp_otp_debug', res.debugCode);
      }
      router.push('/auth/otp');
    } catch (err) {
      setError(err instanceof AppApiError ? err.message : t.commonError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <EntryFlowPanel
      title={t.phoneEntryTitle}
      subtitle={t.phoneEntrySubtitle}
      backSlot={
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm text-[var(--app-ink-muted)] transition hover:text-[var(--app-primary)]"
        >
          <span aria-hidden="true">←</span>
          {t.commonBack}
        </button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label
          htmlFor="phone-local"
          className="block text-[13px] font-medium text-[var(--app-ink-muted)]"
        >
          {t.phoneEntryLabel}
        </label>

        <div className="flex items-center gap-2.5">
          <div className="flex h-14 items-center rounded-[14px] border border-[var(--app-border)] bg-[var(--app-bg)] px-4 text-[17px] font-medium text-[var(--app-ink)]">
            {COUNTRY_CODE}
          </div>

          <input
            id="phone-local"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            autoFocus
            value={formatLocalPhone(phone)}
            onChange={(e) => {
              setPhone(normalizeLocalPhone(e.target.value));
              if (error) setError(null);
            }}
            placeholder={localPlaceholder}
            aria-label={t.phoneEntryLabel}
            className="h-14 min-w-0 flex-1 rounded-[14px] border border-[var(--app-border)] bg-[var(--app-bg)] px-4 text-[17px] text-[var(--app-ink)] outline-none transition placeholder:text-[var(--app-ink-faint)] focus:border-[var(--app-primary)] focus:bg-[var(--app-card)]"
          />
        </div>

        {error ? <p className="text-sm leading-6 text-[var(--color-error)]">{error}</p> : null}

        <button
          type="submit"
          disabled={loading || !canSubmit}
          className={`mt-3 h-14 w-full rounded-[16px] text-base font-semibold transition-all disabled:cursor-not-allowed active:scale-[0.99] ${
            canSubmit
              ? 'bg-[var(--app-primary)] text-white shadow-[var(--app-shadow)]'
              : 'bg-[var(--app-surface)] text-[var(--app-ink-muted)]'
          } ${loading ? 'opacity-80' : ''}`}
        >
          {loading ? t.commonLoading : t.phoneEntryContinue}
        </button>
      </form>
    </EntryFlowPanel>
  );
}
