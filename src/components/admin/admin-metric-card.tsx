import { Card } from "@/components/ui/card";

type AdminMetricCardProps = {
  label: string;
  value: string;
  detail: string;
};

export function AdminMetricCard({
  detail,
  label,
  value,
}: AdminMetricCardProps) {
  return (
    <Card>
      <p className="text-sm text-[var(--color-ink-muted)]">{label}</p>
      <p className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
        {value}
      </p>
      <p className="mt-2 text-sm leading-7 text-[var(--color-ink-muted)]">
        {detail}
      </p>
    </Card>
  );
}
