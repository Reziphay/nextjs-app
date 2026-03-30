'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';

import { useT } from '@/lib/app/i18n/context';
import { useAuthStore, useCurrentUser } from '@/lib/app/stores/auth.store';
import { authService } from '@/lib/app/services/auth.service';

const schema = z.object({
  fullName: z.string().min(2),
});
type FormData = z.infer<typeof schema>;

export default function ProfileEditPage() {
  const t = useT();
  const router = useRouter();
  const user = useCurrentUser();
  const updateUser = useAuthStore((s) => s.updateUser);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: user?.fullName ?? '' },
  });

  const saveMutation = useMutation({
    mutationFn: (data: FormData) => authService.updateProfile(data.fullName),
    onSuccess: (updated) => {
      updateUser(updated);
      router.back();
    },
  });

  const avatarMutation = useMutation({
    mutationFn: (file: File) => authService.uploadAvatar(file),
    onSuccess: (updated) => {
      updateUser(updated);
      setAvatarError(null);
    },
    onError: () => setAvatarError(t.commonError),
  });

  if (!user) return null;

  return (
    <div className="max-w-md mx-auto w-full px-4 pt-6 pb-8">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.back()} className="text-[var(--app-ink-muted)] hover:text-[var(--app-primary)]">
          ← {t.commonBack}
        </button>
        <h1 className="text-xl font-bold text-[var(--app-ink)]">{t.profileEditTitle}</h1>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-[var(--app-primary-surface)] overflow-hidden flex items-center justify-center">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl">👤</span>
            )}
          </div>
          <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[var(--app-primary)] flex items-center justify-center cursor-pointer hover:bg-[var(--app-primary-strong)] transition-colors">
            <span className="text-white text-xs">✎</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) avatarMutation.mutate(file);
              }}
            />
          </label>
        </div>
        {avatarMutation.isPending && <p className="text-xs text-[var(--app-ink-muted)] mt-2">{t.commonLoading}</p>}
        {avatarError && <p className="text-xs text-red-500 mt-2">{avatarError}</p>}
      </div>

      <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--app-ink)] mb-1.5">{t.profileName}</label>
          <input
            {...register('fullName')}
            className="w-full px-4 py-3.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-ink)] focus:outline-none focus:border-[var(--app-primary)]"
          />
          {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--app-ink)] mb-1.5">{t.profilePhone}</label>
          <input
            value={user.phone}
            disabled
            className="w-full px-4 py-3.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-ink-faint)] cursor-not-allowed"
          />
        </div>

        {saveMutation.isError && <p className="text-sm text-red-500">{t.commonError}</p>}

        <button
          type="submit"
          disabled={isSubmitting || saveMutation.isPending}
          className="w-full py-3.5 rounded-2xl bg-[var(--app-primary)] text-white font-semibold disabled:opacity-50 hover:bg-[var(--app-primary-strong)] transition-colors mt-2"
        >
          {saveMutation.isPending ? t.commonLoading : t.profileSave}
        </button>
      </form>
    </div>
  );
}
