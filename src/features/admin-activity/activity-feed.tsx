import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import type { ActivityRecord } from "@/lib/types/admin";

type ActivityFeedProps = {
  items: ActivityRecord[];
};

function getActivityTone(category: ActivityRecord["category"]) {
  if (category === "visibility") {
    return "success" as const;
  }

  if (category === "moderation") {
    return "warning" as const;
  }

  if (category === "account") {
    return "danger" as const;
  }

  return "neutral" as const;
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  if (!items.length) {
    return (
      <EmptyState
        title="No activity yet"
        description="The activity surface is ready for moderation, visibility, and sponsorship events when backend history is available."
      />
    );
  }

  return (
    <Card>
      <div className="grid gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-[var(--color-ink)]">{item.title}</p>
                  <StatusPill label={item.category} tone={getActivityTone(item.category)} />
                </div>
                <p className="mt-2 text-sm leading-7 text-[var(--color-ink-muted)]">
                  {item.detail}
                </p>
              </div>
              <div className="text-sm text-[var(--color-ink-faint)] md:text-right">
                <p>{item.time}</p>
                <p className="mt-1">{item.actor}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
