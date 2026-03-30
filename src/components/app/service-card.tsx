import Link from 'next/link';

import type { ServiceItem } from '@/lib/app/models/discovery';
import { cn } from '@/lib/utils/cn';

import { RatingRow } from './rating-row';

type Props = {
  service: ServiceItem;
  className?: string;
  variant?: 'grid' | 'list';
};

export function ServiceCard({ service, className, variant = 'grid' }: Props) {
  const thumbnail = service.photos[0]?.url ?? null;
  const isVip = service.visibilityLabels.some((l) => l.slug === 'vip');
  const isFree = !service.price;
  const priceDisplay = isFree
    ? 'Free'
    : `${service.price} ${service.currency ?? 'AZN'}`;
  const secondaryLabel =
    service.brand?.name ?? service.category?.name ?? service.owner.fullName;
  const locationLabel = service.address?.city ?? null;

  if (variant === 'list') {
    return (
      <Link
        href={`/ucr/service/${service.id}`}
        className={cn(
          'group flex overflow-hidden rounded-[20px] border border-[var(--app-border)] bg-[var(--app-card)] shadow-[var(--app-shadow)] transition-all hover:border-[var(--app-primary-light)]',
          className,
        )}
      >
        <div className="relative w-24 shrink-0 bg-[var(--app-card-muted)]">
          {thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnail}
              alt={service.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full min-h-[112px] items-center justify-center text-3xl text-[var(--app-primary-light)]">
              🛎️
            </div>
          )}
          {isVip ? (
            <span className="absolute left-2 top-2 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-white">
              VIP
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col justify-between gap-3 p-4">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="line-clamp-1 text-sm font-semibold text-[var(--app-ink)]">
                  {service.name}
                </p>
                <p className="mt-1 line-clamp-1 text-xs font-medium text-[var(--app-primary)]">
                  {secondaryLabel}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-[var(--app-ink)]">
                {priceDisplay}
              </span>
            </div>
            {locationLabel ? (
              <p className="mt-2 line-clamp-1 text-xs text-[var(--app-ink-muted)]">
                {locationLabel}
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-3">
            {service.ratingStats && service.ratingStats.reviewCount > 0 ? (
              <RatingRow
                avgRating={service.ratingStats.avgRating}
                reviewCount={service.ratingStats.reviewCount}
              />
            ) : (
              <span className="text-xs text-[var(--app-ink-faint)]">
                {service.approvalMode === 'MANUAL' ? 'Manual approval' : 'Flexible booking'}
              </span>
            )}

            {service.distanceKm !== null ? (
              <span className="text-xs text-[var(--app-ink-faint)]">
                {service.distanceKm < 1
                  ? `${Math.round(service.distanceKm * 1000)}m`
                  : `${service.distanceKm.toFixed(1)}km`}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/ucr/service/${service.id}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] shadow-[var(--app-shadow)] transition-all hover:border-[var(--app-primary-light)]',
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--app-primary-surface)]">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt={service.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-[var(--app-primary-light)]">
            🛎️
          </div>
        )}
        {isVip ? (
          <span className="absolute right-2 top-2 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-white">
            VIP
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-1 p-3">
        <p className="line-clamp-1 text-sm font-semibold text-[var(--app-ink)]">{service.name}</p>
        {service.brand ? (
          <p className="line-clamp-1 text-xs text-[var(--app-ink-faint)]">{service.brand.name}</p>
        ) : null}
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--app-primary)]">{priceDisplay}</span>
          {service.ratingStats && service.ratingStats.reviewCount > 0 ? (
            <RatingRow
              avgRating={service.ratingStats.avgRating}
              reviewCount={service.ratingStats.reviewCount}
            />
          ) : null}
        </div>
        {service.distanceKm !== null ? (
          <p className="text-xs text-[var(--app-ink-faint)]">
            {service.distanceKm < 1
              ? `${Math.round(service.distanceKm * 1000)}m`
              : `${service.distanceKm.toFixed(1)}km`}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
