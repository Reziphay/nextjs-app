import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import type { VisibilityLabelRecord } from "@/lib/types/admin";
import { formatShortDate } from "@/lib/utils/format";

type VisibilityLabelsPanelProps = {
  labels: VisibilityLabelRecord[];
};

function getLabelTone(label: VisibilityLabelRecord) {
  if (!label.isActive) {
    return "neutral" as const;
  }

  if (label.assignmentCount > 0) {
    return "success" as const;
  }

  return "warning" as const;
}

export function VisibilityLabelsPanel({ labels }: VisibilityLabelsPanelProps) {
  if (!labels.length) {
    return (
      <EmptyState
        title="No visibility labels yet"
        description="Create active labels for brands, services, or users before scheduling assignments."
      />
    );
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold text-[var(--color-ink)]">
        Visibility label library
      </h2>
      <div className="mt-6 grid gap-3">
        {labels.map((label) => (
          <div key={label.id} className="rounded-[20px] bg-[var(--color-surface)] p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-[var(--color-ink)]">{label.name}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs capitalize text-[var(--color-ink-muted)]">
                    {label.targetType}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                  {label.slug} · {label.assignmentCount} assignments
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-ink-muted)]">
                  {label.description ?? "No label description provided."}
                </p>
                <p className="mt-2 text-xs text-[var(--color-ink-faint)]">
                  Updated {formatShortDate(label.updatedAt)}
                </p>
              </div>
              <StatusPill
                label={label.isActive ? "active" : "inactive"}
                tone={getLabelTone(label)}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
