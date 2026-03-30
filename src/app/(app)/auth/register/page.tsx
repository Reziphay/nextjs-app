'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AuthShell } from '@/components/app/auth-shell';
import type { AppRole } from '@/lib/app/models/user';
import { authService } from '@/lib/app/services/auth.service';
import { useT } from '@/lib/app/i18n/context';
import { useAuthStore } from '@/lib/app/stores/auth.store';

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
    <AuthShell
      title={t.registerTitle}
      subtitle={t.registerSubtitle}
      topSlot={
        <button
          onClick={() => router.back()}
          className="text-sm text-[var(--app-ink-muted)] transition hover:text-[var(--app-primary)]"
        >
          ← {t.commonBack}
        </button>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--app-ink)]">
            {t.registerNameLabel}
          </label>
          <input
            {...register('fullName')}
            placeholder={t.registerNamePlaceholder}
            autoFocus
            className="w-full rounded-[16px] border border-transparent bg-[var(--app-bg)] px-4 py-3.5 text-base text-[var(--app-ink)] outline-none transition placeholder:text-[var(--app-ink-faint)] focus:border-[var(--app-primary)]"
          />
          {errors.fullName ? (
            <p className="mt-1 text-xs text-[var(--color-error)]">{errors.fullName.message}</p>
          ) : null}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--app-ink)]">
            {t.registerEmailLabel}
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder={t.registerEmailPlaceholder}
            className="w-full rounded-[16px] border border-transparent bg-[var(--app-bg)] px-4 py-3.5 text-base text-[var(--app-ink)] outline-none transition placeholder:text-[var(--app-ink-faint)] focus:border-[var(--app-primary)]"
          />
          {errors.email ? (
            <p className="mt-1 text-xs text-[var(--color-error)]">{errors.email.message}</p>
          ) : null}
        </div>

        {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 h-14 rounded-[20px] bg-[var(--app-primary)] text-base font-semibold text-white shadow-[var(--app-shadow)] transition-all disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.99]"
        >
          {isSubmitting ? t.commonLoading : t.registerSubmit}
        </button>
      </form>
    </AuthShell>
  );
}
