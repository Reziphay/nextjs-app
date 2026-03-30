'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useT } from '@/lib/app/i18n/context';
import { reservationService } from '@/lib/app/services/reservation.service';
import { StatusBadge } from '@/components/app/status-badge';
import { AppEmptyState } from '@/components/app/empty-state';
import { isCancellableStatus } from '@/lib/app/models/reservation';

export default function ReservationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useT();
  const router = useRouter();
  const qc = useQueryClient();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const { data: reservation, isLoading } = useQuery({
    queryKey: ['reservation', id],
    queryFn: () => reservationService.fetchReservationDetail(id),
  });

  const cancelMutation = useMutation({
    mutationFn: () => reservationService.cancelReservation(id, cancelReason || undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservation', id] });
      qc.invalidateQueries({ queryKey: ['my-reservations'] });
      setShowCancelModal(false);
    },
  });

  const acceptChangeMutation = useMutation({
    mutationFn: (crId: string) => reservationService.acceptChangeRequest(crId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reservation', id] }),
  });

  const rejectChangeMutation = useMutation({
    mutationFn: (crId: string) => reservationService.rejectChangeRequest(crId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reservation', id] }),
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-[var(--app-primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!reservation) return <AppEmptyState icon="⚠️" title={t.commonError} />;

  const statusLabel = `reservationStatus_${reservation.status}` as keyof typeof t;
  const canCancel = isCancellableStatus(reservation.status);
  const pendingOwnerChange = reservation.changeRequests.find(
    (cr) => cr.status === 'PENDING' && cr.initiatedBy === 'OWNER',
  );

  return (
    <div className="max-w-2xl mx-auto w-full px-4 pb-8">
      {/* Back */}
      <div className="sticky top-0 z-10 bg-[var(--app-bg)] py-3 flex items-center gap-3 border-b border-[var(--app-border)] mb-4">
        <button onClick={() => router.back()} className="text-[var(--app-ink-muted)] hover:text-[var(--app-primary)]">
          ← {t.commonBack}
        </button>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-[var(--app-ink)]">{reservation.service.name}</h1>
        <StatusBadge status={reservation.status} label={t[statusLabel] as string} />
      </div>

      {/* Details card */}
      <div className="bg-[var(--app-card)] rounded-2xl border border-[var(--app-border)] p-4 mb-4 flex flex-col gap-3">
        <Row label={t.reservationDate} value={new Date(reservation.startAt).toLocaleDateString()} />
        <Row label={t.reservationTime} value={new Date(reservation.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
        {reservation.service.price && (
          <Row
            label={t.serviceDetailPrice}
            value={`${reservation.service.price} ${reservation.service.currency ?? 'AZN'}`}
          />
        )}
        {reservation.note && (
          <Row label={t.reservationNote} value={reservation.note} />
        )}
        <div className="pt-2 border-t border-[var(--app-divider)]">
          <p className="text-xs text-[var(--app-ink-faint)]">
            {t.serviceDetailOwner}: {reservation.owner.fullName}
          </p>
        </div>
      </div>

      {/* QR code (completed reservations) */}
      {reservation.completionQrToken && reservation.status === 'CONFIRMED' && (
        <div className="bg-[var(--app-card)] rounded-2xl border border-[var(--app-border)] p-4 mb-4 text-center">
          <p className="text-sm font-medium text-[var(--app-ink)] mb-2">QR Check-in</p>
          <div className="text-4xl mb-1">📱</div>
          <p className="text-xs text-[var(--app-ink-faint)] font-mono break-all">
            {reservation.completionQrToken}
          </p>
        </div>
      )}

      {/* Owner change request */}
      {pendingOwnerChange && (
        <div className="bg-[var(--app-primary-soft)] rounded-2xl p-4 mb-4">
          <p className="text-sm font-semibold text-[var(--app-primary)] mb-2">
            {t.changeRequestTitle}
          </p>
          <p className="text-xs text-[var(--app-ink-muted)] mb-1">
            {t.changeRequestNewDate}: {new Date(pendingOwnerChange.requestedStartAt).toLocaleString()}
          </p>
          {pendingOwnerChange.reason && (
            <p className="text-xs text-[var(--app-ink-muted)] mb-3">
              {t.changeRequestReason}: {pendingOwnerChange.reason}
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => acceptChangeMutation.mutate(pendingOwnerChange.id)}
              disabled={acceptChangeMutation.isPending}
              className="flex-1 py-2 rounded-xl bg-[var(--app-primary)] text-white text-sm font-medium disabled:opacity-50"
            >
              {t.changeRequestAccept}
            </button>
            <button
              onClick={() => rejectChangeMutation.mutate(pendingOwnerChange.id)}
              disabled={rejectChangeMutation.isPending}
              className="flex-1 py-2 rounded-xl border border-[var(--app-border)] text-[var(--app-ink)] text-sm font-medium disabled:opacity-50"
            >
              {t.changeRequestReject}
            </button>
          </div>
        </div>
      )}

      {/* Cancel button */}
      {canCancel && (
        <button
          onClick={() => setShowCancelModal(true)}
          className="w-full py-3 rounded-2xl border-2 border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors"
        >
          {t.reservationCancel}
        </button>
      )}

      {/* Cancel modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/40">
          <div className="w-full max-w-lg bg-[var(--app-card)] rounded-t-3xl lg:rounded-3xl p-6">
            <h3 className="text-lg font-bold text-[var(--app-ink)] mb-4">{t.reservationCancel}</h3>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder={t.reservationCancelReason}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-ink)] placeholder:text-[var(--app-ink-faint)] focus:outline-none focus:border-[var(--app-primary)] resize-none mb-4"
            />
            {cancelMutation.isError && <p className="text-sm text-red-500 mb-2">{t.commonError}</p>}
            <div className="flex gap-3">
              <button onClick={() => setShowCancelModal(false)} className="flex-1 py-3 rounded-2xl border border-[var(--app-border)] text-[var(--app-ink)] font-medium">
                {t.commonClose}
              </button>
              <button
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-semibold disabled:opacity-50"
              >
                {cancelMutation.isPending ? t.commonLoading : t.reservationCancelConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-sm text-[var(--app-ink-muted)] shrink-0">{label}</span>
      <span className="text-sm text-[var(--app-ink)] text-right">{value}</span>
    </div>
  );
}
