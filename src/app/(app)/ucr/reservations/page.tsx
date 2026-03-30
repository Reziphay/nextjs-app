'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { useT } from '@/lib/app/i18n/context';
import { reservationService } from '@/lib/app/services/reservation.service';
import { StatusBadge } from '@/components/app/status-badge';
import { AppEmptyState } from '@/components/app/empty-state';
import { isActiveStatus } from '@/lib/app/models/reservation';
import { cn } from '@/lib/utils/cn';

type Tab = 'upcoming' | 'past';

export default function ReservationsPage() {
  const t = useT();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('upcoming');

  const { data: reservations, isLoading } = useQuery({
    queryKey: ['my-reservations'],
    queryFn: () => reservationService.fetchMyReservations(),
  });

  const upcoming = reservations?.filter((r) => isActiveStatus(r.status)) ?? [];
  const past = reservations?.filter((r) => !isActiveStatus(r.status)) ?? [];
  const shown = tab === 'upcoming' ? upcoming : past;

  const statusLabel = (status: string): string => {
    const key = `reservationStatus_${status}` as keyof typeof t;
    return (t[key] as string) ?? status;
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="px-4 pt-6 pb-3">
        <h1 className="text-2xl font-bold text-[var(--app-ink)] mb-4">{t.reservationTitle}</h1>

        {/* Tabs */}
        <div className="flex gap-2 bg-[var(--app-card)] rounded-xl p-1">
          {(['upcoming', 'past'] as Tab[]).map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                'flex-1 py-2 text-sm font-medium rounded-lg transition-colors',
                tab === key
                  ? 'bg-[var(--app-primary)] text-white'
                  : 'text-[var(--app-ink-muted)]',
              )}
            >
              {key === 'upcoming' ? t.reservationUpcoming : t.reservationPast}
              {key === 'upcoming' && upcoming.length > 0 && (
                <span className="ml-1 text-xs opacity-70">({upcoming.length})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-[var(--app-card)] animate-pulse" />
            ))}
          </div>
        ) : shown.length > 0 ? (
          <div className="flex flex-col gap-3">
            {shown.map((r) => (
              <button
                key={r.id}
                onClick={() => router.push(`/ucr/reservation/${r.id}`)}
                className="w-full text-left flex items-start gap-3 p-4 rounded-2xl bg-[var(--app-card)] border border-[var(--app-border)] hover:border-[var(--app-primary-light)] transition-all"
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-xl bg-[var(--app-primary-surface)] overflow-hidden shrink-0 flex items-center justify-center">
                  {r.service.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.service.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>🛎️</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm text-[var(--app-ink)] line-clamp-1">
                      {r.service.name}
                    </p>
                    <StatusBadge status={r.status} label={statusLabel(r.status)} />
                  </div>
                  <p className="text-xs text-[var(--app-ink-faint)] mt-1">
                    {new Date(r.startAt).toLocaleDateString()} · {new Date(r.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {r.service.price && (
                    <p className="text-xs font-medium text-[var(--app-primary)] mt-1">
                      {r.service.price} {r.service.currency ?? 'AZN'}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <AppEmptyState
            icon="📅"
            title={t.reservationEmpty}
            description={t.reservationEmptyDesc}
            action={
              <button
                onClick={() => router.push('/ucr/explore')}
                className="px-5 py-2 rounded-xl bg-[var(--app-primary)] text-white text-sm font-medium"
              >
                {t.navExplore}
              </button>
            }
          />
        )}
      </div>
    </div>
  );
}
