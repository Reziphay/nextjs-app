import { cn } from '@/lib/utils/cn';

type ReziphayLogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
};

export function ReziphayLogo({
  className,
  priority = false,
  size = 88,
}: ReziphayLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/reziphay-logo.png"
      alt="Reziphay logo"
      width={size}
      height={size}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : undefined}
      className={cn('block shrink-0 rounded-[24px] object-cover', className)}
      style={{ width: size, height: size }}
    />
  );
}
