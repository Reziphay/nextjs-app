import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

type EntryFlowPanelProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  intro?: ReactNode;
  backSlot?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
  bodyClassName?: string;
};

export function EntryFlowPanel({
  align = 'left',
  backSlot,
  bodyClassName,
  children,
  className,
  intro,
  subtitle,
  title,
}: EntryFlowPanelProps) {
  const centered = align === 'center';

  return (
    <section
      className={cn(
        'rounded-[30px] border border-[var(--app-border)] bg-[var(--app-card)] p-5 shadow-[0_24px_48px_rgba(15,15,18,0.06)] backdrop-blur-sm sm:p-6',
        className,
      )}
    >
      {backSlot ? <div>{backSlot}</div> : null}

      {title || subtitle || intro ? (
        <div
          className={cn(
            backSlot ? 'mt-5' : '',
            centered ? 'text-center' : '',
          )}
        >
          {intro ? <div>{intro}</div> : null}
          {title ? (
            <h2 className="text-[2rem] font-bold tracking-[-0.04em] text-[var(--app-ink)] sm:text-[2.15rem]">
              {title}
            </h2>
          ) : null}
          {subtitle ? (
            <p
              className={cn(
                'text-[15px] leading-6 text-[var(--app-ink-muted)]',
                title ? 'mt-2' : '',
              )}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className={cn(title || subtitle || intro ? 'mt-8' : '', bodyClassName)}>{children}</div>
    </section>
  );
}
