'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { EntryFlowPanel } from '@/components/app/entry-flow-panel';
import { AppApiError } from '@/lib/app/api/client';
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
  const isComplete = digits.every((digit) => digit !== '');

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

  function fillFrom(index: number, rawValue: string) {
    const pastedDigits = rawValue.replace(/\D/g, '').slice(0, OTP_LENGTH - index).split('');
    if (!pastedDigits.length) return;

    const next = [...digits];
    pastedDigits.forEach((digit, offset) => {
      next[index + offset] = digit;
    });
    setDigits(next);

    const nextIndex = Math.min(index + pastedDigits.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  }

  function handleInput(index: number, value: string) {
    if (value.length > 1) {
      fillFrom(index, value);
      return;
    }

    const char = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    if (error) setError(null);

    if (char && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits];
        next[index] = '';
        setDigits(next);
        return;
      }

      if (index > 0) {
        const next = [...digits];
        next[index - 1] = '';
        setDigits(next);
        inputRefs.current[index - 1]?.focus();
      }
    }

    if (e.key === 'Enter' && isComplete) {
      e.preventDefault();
      void submitCode(digits.join(''));
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
    if (loading || code.length !== OTP_LENGTH) return;

    setLoading(true);
    setError(null);
    try {
      const result = await authService.verifyOtp(phone, code, 'AUTHENTICATE');
      if (result.type === 'authenticated') {
        setAuthenticated(result.session.user);
        const role = result.session.user.activeRole;
        router.replace(role === 'USO' ? '/uso/incoming' : '/ucr/explore');
      } else {
        sessionStorage.setItem('rzp_reg_token', result.pending.registrationToken);
        router.push('/auth/register');
      }
    } catch (err) {
      setError(err instanceof AppApiError ? err.message : t.commonError);
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  return (
    <EntryFlowPanel
      title={t.otpTitle}
      subtitle={t.otpSubtitle(phone)}
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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submitCode(digits.join(''));
        }}
        className="space-y-5"
      >
        <div className="flex justify-between gap-2">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInput(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={loading}
              className="h-14 w-12 rounded-[16px] border border-[var(--app-border)] bg-[var(--app-bg)] text-center text-xl font-bold text-[var(--app-ink)] outline-none transition-colors placeholder:text-[var(--app-ink-faint)] focus:border-[var(--app-primary)] disabled:opacity-50"
            />
          ))}
        </div>

        {error ? <p className="text-sm leading-6 text-[var(--color-error)]">{error}</p> : null}

        <button
          type="submit"
          disabled={loading || !isComplete}
          className={`h-14 w-full rounded-[16px] text-base font-semibold transition-all disabled:cursor-not-allowed active:scale-[0.99] ${
            isComplete
              ? 'bg-[var(--app-primary)] text-white shadow-[var(--app-shadow)]'
              : 'bg-[var(--app-surface)] text-[var(--app-ink-muted)]'
          } ${loading ? 'opacity-80' : ''}`}
        >
          {loading ? t.commonLoading : t.otpVerify}
        </button>

        <div className="text-center">
          {countdown > 0 ? (
            <p className="text-sm text-[var(--app-ink-faint)]">{t.otpResendIn(countdown)}</p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="text-sm font-medium text-[var(--app-primary)] hover:underline"
            >
              {t.otpResend}
            </button>
          )}
        </div>
      </form>
    </EntryFlowPanel>
  );
}
