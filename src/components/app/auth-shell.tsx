import type { ReactNode } from 'react';

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  topSlot?: ReactNode;
};

export function AuthShell({
  children,
  subtitle,
  title,
  topSlot,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--app-base-bg)] px-6 py-8">
      <div className="pointer-events-none absolute right-[-4rem] top-[-2rem] h-56 w-56 rounded-full bg-[var(--rz-ucr-primary-soft)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-[-5rem] h-64 w-64 rounded-full bg-[var(--rz-uso-primary-soft)] blur-3xl" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-sm flex-col justify-center">
        {topSlot ? <div className="mb-6">{topSlot}</div> : null}
        <div className="rounded-[32px] border border-[var(--app-border)] bg-[var(--app-card)] p-6 shadow-[var(--app-shadow)]">
          <div className="mb-8">
            <div className="grid h-12 w-12 place-items-center rounded-[18px] bg-[linear-gradient(135deg,var(--rz-ucr-primary)_0%,var(--rz-uso-primary)_100%)] text-sm font-semibold tracking-[-0.05em] text-white shadow-[var(--app-shadow)]">
              Rz
            </div>
            <h1 className="mt-5 text-[28px] font-bold tracking-[-0.04em] text-[var(--app-ink)]">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-7 text-[var(--app-ink-muted)]">
              {subtitle}
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
