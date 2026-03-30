'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { AuthShell } from '@/components/app/auth-shell';
import { useT } from '@/lib/app/i18n/context';
import { authService } from '@/lib/app/services/auth.service';

export default function PhonePage() {
  const t = useT();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await authService.requestOtp(phone.trim(), 'AUTHENTICATE');
      sessionStorage.setItem('rzp_otp_phone', phone.trim());
      if (res.debugCode) {
        sessionStorage.setItem('rzp_otp_debug', res.debugCode);
      }
      router.push('/auth/otp');
    } catch {
      setError(t.commonError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={t.phoneEntryTitle}
      subtitle={t.phoneEntrySubtitle}
      topSlot={
        <button
          onClick={() => router.back()}
          className="text-sm text-[var(--app-ink-muted)] transition hover:text-[var(--app-primary)]"
        >
          ← {t.commonBack}
        </button>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t.phoneEntryPlaceholder}
          autoFocus
          className="w-full rounded-[16px] border border-transparent bg-[var(--app-bg)] px-4 py-3.5 text-base text-[var(--app-ink)] outline-none transition placeholder:text-[var(--app-ink-faint)] focus:border-[var(--app-primary)]"
        />

        {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}

        <button
          type="submit"
          disabled={loading || !phone.trim()}
          className="mt-2 h-14 rounded-[20px] bg-[var(--app-primary)] text-base font-semibold text-white shadow-[var(--app-shadow)] transition-all disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.99]"
        >
          {loading ? t.commonLoading : t.phoneEntryContinue}
        </button>
      </form>
    </AuthShell>
  );
}
