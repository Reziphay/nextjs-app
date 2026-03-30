import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import type { BrandItem } from '@/lib/app/models/discovery';
import { RatingRow } from './rating-row';

type Props = {
  brand: BrandItem;
  className?: string;
};

export function BrandCard({ brand, className }: Props) {
  const isVip = brand.visibilityLabels.some((l) => l.slug === 'vip');

  return (
    <Link
      href={`/ucr/brand/${brand.id}`}
      className={cn(
        'group flex items-center gap-3 p-3 rounded-2xl bg-[var(--app-card)] border border-[var(--app-border)] hover:border-[var(--app-primary-light)] hover:shadow-md transition-all',
        className,
      )}
    >
      {/* Logo */}
      <div className="w-12 h-12 rounded-xl bg-[var(--app-primary-surface)] overflow-hidden shrink-0 flex items-center justify-center">
        {brand.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xl">🏪</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm text-[var(--app-ink)] line-clamp-1">{brand.name}</p>
          {isVip && (
            <span className="shrink-0 px-1.5 py-0.5 bg-amber-400 text-white text-xs font-bold rounded-full">
              VIP
            </span>
          )}
        </div>
        <p className="text-xs text-[var(--app-ink-faint)] line-clamp-1 mt-0.5">
          {brand.owner.fullName}
        </p>
        {brand.ratingStats && brand.ratingStats.reviewCount > 0 && (
          <div className="mt-1">
            <RatingRow
              avgRating={brand.ratingStats.avgRating}
              reviewCount={brand.ratingStats.reviewCount}
            />
          </div>
        )}
      </div>
    </Link>
  );
}
