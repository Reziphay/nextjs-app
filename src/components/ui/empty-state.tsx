import { Card } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ description, title }: EmptyStateProps) {
  return (
    <Card tone="soft" className="border-dashed text-center">
      <h3 className="text-lg font-semibold text-[var(--color-ink)]">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-[var(--color-ink-muted)]">
        {description}
      </p>
    </Card>
  );
}
