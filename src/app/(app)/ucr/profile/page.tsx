'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useT } from '@/lib/app/i18n/context';
import { useAuthStore, useCurrentUser } from '@/lib/app/stores/auth.store';
import { authService } from '@/lib/app/services/auth.service';
import { hasUsoRole } from '@/lib/app/models/user';

export default function UcrProfilePage() {
  const t = useT();
  const router = useRouter();
  const user = useCurrentUser();
  const { setAuthenticated, setUnauthenticated } = useAuthStore();
  const qc = useQueryClient();
  const [showLogout, setShowLogout] = useState(false);

  const switchMutation = useMutation({
    mutationFn: () => authService.switchRole('USO'),
    onSuccess: (session) => {
      setAuthenticated(session.user);
      qc.clear();
      router.replace('/uso/incoming');
    },
  });

  const activateMutation = useMutation({
    mutationFn: () => authService.activateUso(),
    onSuccess: (session) => {
      setAuthenticated(session.user);
      qc.clear();
      router.replace('/uso/incoming');
    },
  });

  async function handleLogout() {
    await authService.logout();
    setUnauthenticated();
    router.replace('/onboarding');
  }

  if (!user) return null;

  const canSwitchToUso = hasUsoRole(user);

  return (
    <div className="max-w-2xl mx-auto w-full px-4 pt-6 pb-8">
      <h1 className="text-2xl font-bold text-[var(--app-ink)] mb-6">{t.navProfile}</h1>

      {/* Avatar + name */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-[var(--app-primary-surface)] overflow-hidden flex items-center justify-center">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl">👤</span>
          )}
        </div>
        <div>
          <p className="text-lg font-bold text-[var(--app-ink)]">{user.fullName}</p>
          <p className="text-sm text-[var(--app-ink-muted)]">{user.email ?? user.phone}</p>
        </div>
        <button
          onClick={() => router.push('/ucr/profile/edit')}
          className="ml-auto text-sm text-[var(--app-primary)] font-medium hover:underline"
        >
          {t.commonEdit}
        </button>
      </div>

      {/* Menu items */}
      <div className="flex flex-col gap-2">
        <MenuItem icon="🔖" label={t.profileMyFavorites} onClick={() => router.push('/ucr/favorites')} />
        <MenuItem icon="📅" label={t.reservationTitle} onClick={() => router.push('/ucr/reservations')} />
        <MenuItem icon="⚙️" label={t.settingsTitle} onClick={() => router.push('/settings')} />

        <div className="h-px bg-[var(--app-divider)] my-2" />

        {canSwitchToUso ? (
          <MenuItem
            icon="🏪"
            label={t.profileSwitchToProvider}
            onClick={() => switchMutation.mutate()}
            loading={switchMutation.isPending}
            accent
          />
        ) : (
          <MenuItem
            icon="🏪"
            label={t.profileBecomeProvider}
            onClick={() => activateMutation.mutate()}
            loading={activateMutation.isPending}
            accent
          />
        )}

        <div className="h-px bg-[var(--app-divider)] my-2" />

        <MenuItem
          icon="🚪"
          label={t.profileLogout}
          onClick={() => setShowLogout(true)}
          danger
        />
      </div>

      {/* Logout confirm modal */}
      {showLogout && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/40">
          <div className="w-full max-w-sm bg-[var(--app-card)] rounded-t-3xl lg:rounded-3xl p-6">
            <p className="text-base font-semibold text-[var(--app-ink)] mb-6 text-center">
              {t.profileLogoutConfirm}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogout(false)}
                className="flex-1 py-3 rounded-2xl border border-[var(--app-border)] text-[var(--app-ink)] font-medium"
              >
                {t.commonCancel}
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-semibold"
              >
                {t.profileLogout}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  loading,
  accent,
  danger,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  loading?: boolean;
  accent?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-[var(--app-card)] border border-[var(--app-border)] hover:border-[var(--app-primary-light)] transition-colors disabled:opacity-60"
    >
      <span className="text-lg">{icon}</span>
      <span
        className={
          danger
            ? 'text-red-500 font-medium text-sm'
            : accent
            ? 'text-[var(--app-primary)] font-medium text-sm'
            : 'text-[var(--app-ink)] text-sm'
        }
      >
        {loading ? '...' : label}
      </span>
      <span className="ml-auto text-[var(--app-ink-faint)] text-sm">›</span>
    </button>
  );
}
