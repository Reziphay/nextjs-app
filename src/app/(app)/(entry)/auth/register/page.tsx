'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { EntryFlowPanel } from '@/components/app/entry-flow-panel';
import { useT } from '@/lib/app/i18n/context';
import type { AppRole } from '@/lib/app/models/user';
import { authService } from '@/lib/app/services/auth.service';
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
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

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
    <EntryFlowPanel
      title={t.registerTitle}
      subtitle={t.registerSubtitle}
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[var(--app-ink-muted)]">
            {t.registerNameLabel}
          </label>
          <input
            {...register('fullName')}
            placeholder={t.registerNamePlaceholder}
            autoFocus
            className="h-14 w-full rounded-[14px] border border-[var(--app-border)] bg-[var(--app-bg)] px-4 text-base text-[var(--app-ink)] outline-none transition placeholder:text-[var(--app-ink-faint)] focus:border-[var(--app-primary)] focus:bg-[var(--app-card)]"
          />
          {errors.fullName ? (
            <p className="mt-1 text-xs leading-5 text-[var(--color-error)]">
              {errors.fullName.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[var(--app-ink-muted)]">
            {t.registerEmailLabel}
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder={t.registerEmailPlaceholder}
            className="h-14 w-full rounded-[14px] border border-[var(--app-border)] bg-[var(--app-bg)] px-4 text-base text-[var(--app-ink)] outline-none transition placeholder:text-[var(--app-ink-faint)] focus:border-[var(--app-primary)] focus:bg-[var(--app-card)]"
          />
          {errors.email ? (
            <p className="mt-1 text-xs leading-5 text-[var(--color-error)]">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        {error ? <p className="text-sm leading-6 text-[var(--color-error)]">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting || !isValid}
          className={`mt-3 h-14 w-full rounded-[16px] text-base font-semibold transition-all disabled:cursor-not-allowed active:scale-[0.99] ${
            isValid
              ? 'bg-[var(--app-primary)] text-white shadow-[var(--app-shadow)]'
              : 'bg-[var(--app-surface)] text-[var(--app-ink-muted)]'
          } ${isSubmitting ? 'opacity-80' : ''}`}
        >
          {isSubmitting ? t.commonLoading : t.registerSubmit}
        </button>
      </form>
    </EntryFlowPanel>
  );
}
