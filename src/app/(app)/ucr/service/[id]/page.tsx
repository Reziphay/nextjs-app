'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useT } from '@/lib/app/i18n/context';
import { discoveryService } from '@/lib/app/services/discovery.service';
import { reservationService } from '@/lib/app/services/reservation.service';
import { RatingRow } from '@/components/app/rating-row';
import { AppEmptyState } from '@/components/app/empty-state';

export default function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useT();
  const router = useRouter();
  const qc = useQueryClient();

  const [showBooking, setShowBooking] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingNote, setBookingNote] = useState('');
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const { data: service, isLoading, error } = useQuery({
    queryKey: ['service', id],
    queryFn: () => discoveryService.fetchServiceDetail(id),
  });

  const { data: myReservations } = useQuery({
    queryKey: ['my-reservations'],
    queryFn: () => reservationService.fetchMyReservations(),
  });

  const activeReservation = myReservations?.find(
    (r) => r.service.id === id && (r.status === 'PENDING' || r.status === 'CONFIRMED'),
  );

  const bookMutation = useMutation({
    mutationFn: () => {
      const startAt = new Date(`${bookingDate}T${bookingTime}`).toISOString();
      return reservationService.createReservation({
        serviceId: id,
        startAt,
        note: bookingNote || undefined,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-reservations'] });
      setShowBooking(false);
      router.push('/ucr/reservations');
    },
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-[var(--app-primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !service) {
    return <AppEmptyState icon="⚠️" title={t.commonError} action={
      <button onClick={() => router.back()} className="text-sm text-[var(--app-primary)]">{t.commonBack}</button>
    } />;
  }

  const isManual = service.approvalMode === 'MANUAL';
  const isFree = !service.price;
  const priceDisplay = isFree ? t.serviceDetailFree : `${service.price} ${service.currency ?? 'AZN'}`;

  return (
    <div className="flex flex-col max-w-2xl mx-auto w-full">
      {/* Back button */}
      <div className="sticky top-0 z-10 bg-[var(--app-bg)] px-4 py-3 flex items-center gap-3 border-b border-[var(--app-border)]">
        <button onClick={() => router.back()} className="text-[var(--app-ink-muted)] hover:text-[var(--app-primary)]">
          ← {t.commonBack}
        </button>
      </div>

      <div className="px-4 pb-32">
        {/* Photo carousel */}
        {service.photos.length > 0 ? (
          <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 mt-4 bg-[var(--app-card)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={service.photos[activePhotoIndex].url}
              alt={service.name}
              className="w-full h-full object-cover"
            />
            {service.photos.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {service.photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhotoIndex(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      i === activePhotoIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-video rounded-2xl bg-[var(--app-primary-surface)] flex items-center justify-center mb-4 mt-4">
            <span className="text-6xl">🛎️</span>
          </div>
        )}

        {/* Title + price */}
        <h1 className="text-xl font-bold text-[var(--app-ink)] mb-1">{service.name}</h1>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="text-lg font-semibold text-[var(--app-primary)]">{priceDisplay}</span>
          {service.ratingStats && service.ratingStats.reviewCount > 0 && (
            <RatingRow
              avgRating={service.ratingStats.avgRating}
              reviewCount={service.ratingStats.reviewCount}
              size="md"
            />
          )}
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--app-card)] border border-[var(--app-border)] text-[var(--app-ink-muted)]">
            {isManual ? t.serviceDetailApprovalManual : t.serviceDetailApprovalAuto}
          </span>
        </div>

        {/* Category + brand */}
        <div className="flex flex-wrap gap-2 mb-4">
          {service.category && (
            <span className="text-xs px-2 py-1 rounded-full bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
              {service.category.name}
            </span>
          )}
          {service.brand && (
            <button
              onClick={() => router.push(`/ucr/brand/${service.brand!.id}`)}
              className="text-xs px-2 py-1 rounded-full bg-[var(--app-card)] border border-[var(--app-border)] text-[var(--app-ink)] hover:border-[var(--app-primary)]"
            >
              {service.brand.name}
            </button>
          )}
        </div>

        {/* Owner */}
        <button
          onClick={() => router.push(`/ucr/provider/${service.owner.id}`)}
          className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--app-card)] border border-[var(--app-border)] mb-4 hover:border-[var(--app-primary-light)] transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-[var(--app-primary-surface)] flex items-center justify-center shrink-0">
            {service.owner.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={service.owner.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span>👤</span>
            )}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-[var(--app-ink)]">{service.owner.fullName}</p>
            <p className="text-xs text-[var(--app-ink-faint)]">{t.serviceDetailOwner}</p>
          </div>
        </button>

        {/* Description */}
        {service.description && (
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-[var(--app-ink)] mb-1">{t.serviceDetailDescription}</h2>
            <p className="text-sm text-[var(--app-ink-muted)] leading-relaxed">{service.description}</p>
          </div>
        )}

        {/* Active reservation notice */}
        {activeReservation && (
          <div className="p-3 rounded-xl bg-[var(--app-primary-soft)] mb-4">
            <p className="text-sm font-medium text-[var(--app-primary)]">
              ✓ {t.serviceDetailActiveReservation}
            </p>
          </div>
        )}
      </div>

      {/* Fixed booking button */}
      <div className="fixed bottom-20 lg:bottom-6 left-0 right-0 max-w-2xl mx-auto px-4">
        {!activeReservation && (
          <button
            onClick={() => setShowBooking(true)}
            className="w-full py-4 rounded-2xl bg-[var(--app-primary)] text-white font-semibold text-base hover:bg-[var(--app-primary-strong)] active:scale-[0.98] transition-all shadow-lg"
          >
            {isManual ? t.serviceDetailRequestBook : t.serviceDetailBook}
          </button>
        )}
      </div>

      {/* Booking modal */}
      {showBooking && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/40">
          <div className="w-full max-w-lg bg-[var(--app-card)] rounded-t-3xl lg:rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[var(--app-ink)]">{t.reservationCreateTitle}</h3>
              <button onClick={() => setShowBooking(false)} className="text-[var(--app-ink-muted)]">✕</button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--app-ink)] mb-1">{t.reservationDate}</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-ink)] focus:outline-none focus:border-[var(--app-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--app-ink)] mb-1">{t.reservationTime}</label>
                <input
                  type="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-ink)] focus:outline-none focus:border-[var(--app-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--app-ink)] mb-1">
                  {t.reservationNote}
                </label>
                <textarea
                  value={bookingNote}
                  onChange={(e) => setBookingNote(e.target.value)}
                  placeholder={t.reservationNotePlaceholder}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-ink)] placeholder:text-[var(--app-ink-faint)] focus:outline-none focus:border-[var(--app-primary)] resize-none"
                />
              </div>

              {bookMutation.isError && (
                <p className="text-sm text-red-500">{t.commonError}</p>
              )}

              <button
                onClick={() => bookMutation.mutate()}
                disabled={!bookingDate || !bookingTime || bookMutation.isPending}
                className="w-full py-3.5 rounded-2xl bg-[var(--app-primary)] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--app-primary-strong)] transition-colors"
              >
                {bookMutation.isPending ? t.commonLoading : t.reservationConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
