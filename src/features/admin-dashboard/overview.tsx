import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { Card } from "@/components/ui/card";
import type { AdminOverview } from "@/lib/types/admin";

type AdminOverviewProps = {
  overview: AdminOverview;
};

export function AdminOverviewSection({ overview }: AdminOverviewProps) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 xl:grid-cols-4">
        {overview.kpis.map((item) => (
          <AdminMetricCard
            key={item.label}
            label={item.label}
            value={item.value}
            detail={item.detail}
          />
        ))}
      </div>
      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">
          Recent operational activity
        </h2>
        <div className="mt-6 grid gap-4">
          {overview.activity.map((item) => (
            <div
              key={item.id}
              className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <p className="font-medium text-[var(--color-ink)]">{item.title}</p>
                <p className="text-sm text-[var(--color-ink-faint)]">{item.time}</p>
              </div>
              <p className="mt-2 text-sm leading-7 text-[var(--color-ink-muted)]">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
