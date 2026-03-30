import { Button } from "@/components/ui/button";

type AdminTopbarProps = {
  title: string;
  description: string;
  actionLabel?: string;
};

export function AdminTopbar({
  actionLabel,
  description,
  title,
}: AdminTopbarProps) {
  return (
    <div className="flex flex-col justify-between gap-4 rounded-[28px] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-[var(--shadow-soft)] backdrop-blur-sm md:flex-row md:items-center">
      <div>
        <p className="text-sm font-medium text-[var(--color-ink-muted)]">
          Hidden operations
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--color-ink-muted)]">
          {description}
        </p>
      </div>
      {actionLabel ? <Button kind="admin">{actionLabel}</Button> : null}
    </div>
  );
}
