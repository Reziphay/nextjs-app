import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import type { ServiceItem } from '@/lib/app/models/discovery';
import { RatingRow } from './rating-row';

type Props = {
  service: ServiceItem;
  className?: string;
};

export function ServiceCard({ service, className }: Props) {
  const thumbnail = service.photos[0]?.url ?? null;
  const isVip = service.visibilityLabels.some((l) => l.slug === 'vip');
  const isFree = !service.price;
  const priceDisplay = isFree
    ? 'Free'
    : `${service.price} ${service.currency ?? 'AZN'}`;

  return (
    <Link
      href={`/ucr/service/${service.id}`}
      className={cn(
        'group flex flex-col rounded-2xl overflow-hidden bg-[var(--app-card)] border border-[var(--app-border)] hover:border-[var(--app-primary-light)] hover:shadow-md transition-all',
        className,
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] bg-[var(--app-primary-surface)] overflow-hidden">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-[var(--app-primary-light)]">
            🛎️
          </div>
        )}
        {isVip && (
          <span className="absolute top-2 right-2 px-2 py-0.5 bg-amber-400 text-white text-xs font-bold rounded-full">
            VIP
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1">
        <p className="font-semibold text-sm text-[var(--app-ink)] line-clamp-1">{service.name}</p>
        {service.brand && (
          <p className="text-xs text-[var(--app-ink-faint)] line-clamp-1">{service.brand.name}</p>
        )}
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm font-medium text-[var(--app-primary)]">{priceDisplay}</span>
          {service.ratingStats && service.ratingStats.reviewCount > 0 && (
            <RatingRow
              avgRating={service.ratingStats.avgRating}
              reviewCount={service.ratingStats.reviewCount}
            />
          )}
        </div>
        {service.distanceKm !== null && (
          <p className="text-xs text-[var(--app-ink-faint)]">
            {service.distanceKm < 1
              ? `${Math.round(service.distanceKm * 1000)}m`
              : `${service.distanceKm.toFixed(1)}km`}
          </p>
        )}
      </div>
    </Link>
  );
}
