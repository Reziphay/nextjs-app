import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { AnalyticsOverviewData } from "@/lib/types/admin";

type AnalyticsOverviewProps = {
  data: AnalyticsOverviewData | null;
};

export function AnalyticsOverview({ data }: AnalyticsOverviewProps) {
  if (!data?.metrics.length && !data?.series.length) {
    return (
      <EmptyState
        title="No analytics data yet"
        description="The analytics surface is ready for backend metrics, but it remains calm when data is unavailable."
      />
    );
  }

  return (
    <div className="grid gap-6">
      {data?.metrics.length ? (
        <div className="grid gap-6 xl:grid-cols-3">
          {data.metrics.map((item) => (
            <Card key={item.label}>
              <p className="text-sm text-[var(--color-ink-muted)]">{item.label}</p>
              <p className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">
                {item.value}
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--color-ink-muted)]">
                {item.detail}
              </p>
            </Card>
          ))}
        </div>
      ) : null}
      {data?.series.length ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {data.series.map((item) => (
            <Card key={item.label}>
              <p className="text-sm text-[var(--color-ink-muted)]">{item.label}</p>
              <div className="mt-6 flex h-40 items-end gap-2">
                {item.values.map((value, index) => (
                  <div
                    key={`${item.label}-${index}`}
                    className="flex-1 rounded-t-[12px] bg-[var(--color-primary)]/70"
                    style={{ height: `${Math.max(value / 4, 16)}px` }}
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
