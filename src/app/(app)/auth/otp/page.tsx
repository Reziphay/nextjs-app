'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { AuthShell } from '@/components/app/auth-shell';
import { authService } from '@/lib/app/services/auth.service';
import { useT } from '@/lib/app/i18n/context';
import { useAuthStore } from '@/lib/app/stores/auth.store';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function OtpPage() {
  const t = useT();
  const router = useRouter();
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const phone = typeof window !== 'undefined' ? sessionStorage.getItem('rzp_otp_phone') ?? '' : '';
  const debugCode = typeof window !== 'undefined' ? sessionStorage.getItem('rzp_otp_debug') ?? '' : '';

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (debugCode.length === OTP_LENGTH) {
      setDigits(debugCode.split(''));
    }
  }, [debugCode]);

  function handleInput(index: number, value: string) {
    const char = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);

    if (char && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (next.every((d) => d !== '') && char) {
      submitCode(next.join(''));
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleResend() {
    if (countdown > 0) return;
    setCountdown(RESEND_SECONDS);
    setError(null);
    try {
      const res = await authService.requestOtp(phone, 'AUTHENTICATE');
      if (res.debugCode) sessionStorage.setItem('rzp_otp_debug', res.debugCode);
    } catch {
      setError(t.commonError);
    }
  }

  async function submitCode(code: string) {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const result = await authService.verifyOtp(phone, code);
      if (result.type === 'authenticated') {
        setAuthenticated(result.session.user);
        const role = result.session.user.activeRole;
        router.replace(role === 'USO' ? '/uso/incoming' : '/ucr/explore');
      } else {
        sessionStorage.setItem('rzp_reg_token', result.pending.registrationToken);
        router.push('/auth/register');
      }
    } catch {
      setError(t.commonError);
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={t.otpTitle}
      subtitle={t.otpSubtitle(phone)}
      topSlot={
        <button
          onClick={() => router.back()}
          className="text-sm text-[var(--app-ink-muted)] transition hover:text-[var(--app-primary)]"
        >
          ← {t.commonBack}
        </button>
      }
    >
      <div className="flex gap-3 justify-center mb-6">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleInput(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={loading}
            className="h-14 w-12 rounded-[16px] border border-transparent bg-[var(--app-bg)] text-center text-xl font-bold text-[var(--app-ink)] outline-none transition-colors focus:border-[var(--app-primary)] disabled:opacity-50"
          />
        ))}
      </div>

      {error ? <p className="mb-4 text-center text-sm text-[var(--color-error)]">{error}</p> : null}

      {loading ? (
        <p className="mb-4 text-center text-sm text-[var(--app-ink-muted)]">{t.commonLoading}</p>
      ) : null}

      <div className="text-center">
        {countdown > 0 ? (
          <p className="text-sm text-[var(--app-ink-faint)]">{t.otpResendIn(countdown)}</p>
        ) : (
          <button
            onClick={handleResend}
            className="text-sm font-medium text-[var(--app-primary)] hover:underline"
          >
            {t.otpResend}
          </button>
        )}
      </div>
    </AuthShell>
  );
}
