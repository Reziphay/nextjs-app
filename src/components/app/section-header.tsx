import Link from 'next/link';

type Props = {
  title: string;
  seeAllHref?: string;
  seeAllLabel?: string;
};

export function SectionHeader({ title, seeAllHref, seeAllLabel = 'See all' }: Props) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-base font-bold text-[var(--app-ink)]">{title}</h2>
      {seeAllHref && (
        <Link
          href={seeAllHref}
          className="text-sm text-[var(--app-primary)] font-medium hover:underline"
        >
          {seeAllLabel}
        </Link>
      )}
    </div>
  );
}
