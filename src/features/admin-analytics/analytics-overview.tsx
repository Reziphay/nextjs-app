import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { AnalyticsSeries } from "@/lib/types/admin";

type AnalyticsOverviewProps = {
  series: AnalyticsSeries[] | null;
};

export function AnalyticsOverview({ series }: AnalyticsOverviewProps) {
  if (!series?.length) {
    return (
      <EmptyState
        title="No analytics data yet"
        description="The analytics surface is ready for backend metrics, but it remains calm when data is unavailable."
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {series.map((item) => (
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
  );
}
