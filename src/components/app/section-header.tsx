import Link from 'next/link';

type Props = {
  title: string;
  seeAllHref?: string;
  seeAllLabel?: string;
};

export function SectionHeader({ title, seeAllHref, seeAllLabel = 'See all' }: Props) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-[var(--app-ink)]">
        {title}
      </h2>
      {seeAllHref && (
        <Link
          href={seeAllHref}
          className="text-sm font-medium text-[var(--app-primary)] hover:underline"
        >
          {seeAllLabel}
        </Link>
      )}
    </div>
  );
}
