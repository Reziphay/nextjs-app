'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { useT } from '@/lib/app/i18n/context';
import { authService } from '@/lib/app/services/auth.service';
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

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Auto-fill debug code in dev
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
    // Auto-submit when all filled
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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[var(--app-bg)]">
      <div className="w-full max-w-sm">
        <button
          onClick={() => router.back()}
          className="mb-8 text-sm text-[var(--app-ink-muted)] hover:text-[var(--app-primary)] flex items-center gap-1"
        >
          ← {t.commonBack}
        </button>

        <h1 className="text-2xl font-bold text-[var(--app-ink)] mb-2">{t.otpTitle}</h1>
        <p className="text-[var(--app-ink-muted)] text-sm mb-8">{t.otpSubtitle(phone)}</p>

        {/* OTP inputs */}
        <div className="flex gap-3 justify-center mb-6">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleInput(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={loading}
              className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-ink)] focus:outline-none focus:border-[var(--app-primary)] disabled:opacity-50 transition-colors"
            />
          ))}
        </div>

        {error && <p className="text-sm text-red-500 text-center mb-4">{error}</p>}

        {loading && (
          <p className="text-sm text-[var(--app-ink-muted)] text-center mb-4">{t.commonLoading}</p>
        )}

        {/* Resend */}
        <div className="text-center">
          {countdown > 0 ? (
            <p className="text-sm text-[var(--app-ink-faint)]">{t.otpResendIn(countdown)}</p>
          ) : (
            <button
              onClick={handleResend}
              className="text-sm text-[var(--app-primary)] font-medium hover:underline"
            >
              {t.otpResend}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
