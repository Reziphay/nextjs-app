'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { useT } from '@/lib/app/i18n/context';
import { authService } from '@/lib/app/services/auth.service';
import { useAuthStore } from '@/lib/app/stores/auth.store';
import type { AppRole } from '@/lib/app/models/user';

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const t = useT();
  const router = useRouter();
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const [error, setError] = useState<string | null>(null);

  const registrationToken =
    typeof window !== 'undefined' ? sessionStorage.getItem('rzp_reg_token') ?? '' : '';
  const role: AppRole =
    (typeof window !== 'undefined'
      ? (sessionStorage.getItem('rzp_onboard_role') as AppRole | null)
      : null) ?? 'UCR';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setError(null);
    try {
      const session = await authService.completeRegistration(
        registrationToken,
        data.fullName,
        data.email,
        role,
      );
      setAuthenticated(session.user);
      sessionStorage.removeItem('rzp_reg_token');
      sessionStorage.removeItem('rzp_onboard_role');
      router.replace(session.user.activeRole === 'USO' ? '/uso/incoming' : '/ucr/explore');
    } catch {
      setError(t.commonError);
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

        <h1 className="text-2xl font-bold text-[var(--app-ink)] mb-2">{t.registerTitle}</h1>
        <p className="text-[var(--app-ink-muted)] text-sm mb-8">{t.registerSubtitle}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--app-ink)] mb-1.5">
              {t.registerNameLabel}
            </label>
            <input
              {...register('fullName')}
              placeholder={t.registerNamePlaceholder}
              autoFocus
              className="w-full px-4 py-3.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-ink)] placeholder:text-[var(--app-ink-faint)] focus:outline-none focus:border-[var(--app-primary)] text-base"
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--app-ink)] mb-1.5">
              {t.registerEmailLabel}
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder={t.registerEmailPlaceholder}
              className="w-full px-4 py-3.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-ink)] placeholder:text-[var(--app-ink-faint)] focus:outline-none focus:border-[var(--app-primary)] text-base"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-[var(--app-primary)] text-white font-semibold text-base hover:bg-[var(--app-primary-strong)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all mt-2"
          >
            {isSubmitting ? t.commonLoading : t.registerSubmit}
          </button>
        </form>
      </div>
    </div>
  );
}
