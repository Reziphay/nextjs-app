import Link from 'next/link';

import type { BrandItem } from '@/lib/app/models/discovery';
import { cn } from '@/lib/utils/cn';

import { RatingRow } from './rating-row';

type Props = {
  brand: BrandItem;
  className?: string;
  variant?: 'row' | 'compact';
};

export function BrandCard({ brand, className, variant = 'row' }: Props) {
  const isVip = brand.visibilityLabels.some((l) => l.slug === 'vip');
  const locationLabel = brand.address?.city ?? brand.owner.fullName;

  if (variant === 'compact') {
    return (
      <Link
        href={`/ucr/brand/${brand.id}`}
        className={cn(
          'group w-[148px] shrink-0 overflow-hidden rounded-[20px] border border-[var(--app-border)] bg-[var(--app-card)] shadow-[var(--app-shadow)] transition hover:-translate-y-0.5 hover:border-[var(--app-primary-light)]',
          className,
        )}
      >
        <div className="relative flex h-24 items-center justify-center bg-[var(--app-card-muted)]">
          {brand.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.logoUrl} alt={brand.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl">🏪</span>
          )}
          {isVip ? (
            <span className="absolute right-2 top-2 shrink-0 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-white">
              VIP
            </span>
          ) : null}
        </div>

        <div className="p-3">
          <p className="line-clamp-1 text-sm font-semibold text-[var(--app-ink)]">{brand.name}</p>
          <p className="mt-1 line-clamp-1 text-xs text-[var(--app-ink-muted)]">{locationLabel}</p>
          {brand.ratingStats && brand.ratingStats.reviewCount > 0 ? (
            <RatingRow
              avgRating={brand.ratingStats.avgRating}
              reviewCount={brand.ratingStats.reviewCount}
              className="mt-2"
            />
          ) : null}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/ucr/brand/${brand.id}`}
      className={cn(
        'group flex items-center gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-3 shadow-[var(--app-shadow)] transition-all hover:border-[var(--app-primary-light)]',
        className,
      )}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--app-card-muted)]">
        {brand.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={brand.logoUrl} alt={brand.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-xl">🏪</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="line-clamp-1 text-sm font-semibold text-[var(--app-ink)]">{brand.name}</p>
          {isVip ? (
            <span className="shrink-0 rounded-full bg-amber-400 px-1.5 py-0.5 text-xs font-bold text-white">
              VIP
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 line-clamp-1 text-xs text-[var(--app-ink-faint)]">
          {locationLabel}
        </p>
        {brand.ratingStats && brand.ratingStats.reviewCount > 0 ? (
          <div className="mt-1">
            <RatingRow
              avgRating={brand.ratingStats.avgRating}
              reviewCount={brand.ratingStats.reviewCount}
            />
          </div>
        ) : null}
      </div>
    </Link>
  );
}
