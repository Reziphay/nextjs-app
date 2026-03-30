'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[var(--app-bg)]">
      <div className="w-full max-w-sm">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="mb-8 text-sm text-[var(--app-ink-muted)] hover:text-[var(--app-primary)] flex items-center gap-1"
        >
          ← {t.commonBack}
        </button>

        <h1 className="text-2xl font-bold text-[var(--app-ink)] mb-2">{t.phoneEntryTitle}</h1>
        <p className="text-[var(--app-ink-muted)] text-sm mb-8">{t.phoneEntrySubtitle}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t.phoneEntryPlaceholder}
            autoFocus
            className="w-full px-4 py-3.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-ink)] placeholder:text-[var(--app-ink-faint)] focus:outline-none focus:border-[var(--app-primary)] text-base"
          />

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !phone.trim()}
            className="w-full py-3.5 rounded-2xl bg-[var(--app-primary)] text-white font-semibold text-base hover:bg-[var(--app-primary-strong)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
          >
            {loading ? t.commonLoading : t.phoneEntryContinue}
          </button>
        </form>
      </div>
    </div>
  );
}
