import { cn } from '@/lib/utils/cn';

type Props = {
  avgRating: number;
  reviewCount: number;
  size?: 'sm' | 'md';
  className?: string;
};

export function RatingRow({ avgRating, reviewCount, size = 'sm', className }: Props) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <span className={cn('text-amber-400', size === 'sm' ? 'text-xs' : 'text-sm')}>★</span>
      <span
        className={cn(
          'font-medium text-[var(--app-ink)]',
          size === 'sm' ? 'text-xs' : 'text-sm',
        )}
      >
        {avgRating.toFixed(1)}
      </span>
      {reviewCount > 0 && (
        <span className={cn('text-[var(--app-ink-faint)]', size === 'sm' ? 'text-xs' : 'text-sm')}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
