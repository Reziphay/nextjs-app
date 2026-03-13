import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import type { VisibilityAssignmentRecord } from "@/lib/types/admin";
import { formatDateRange } from "@/lib/utils/format";

type VisibilityAssignmentsPanelProps = {
  assignments: VisibilityAssignmentRecord[];
};

function getAssignmentTone(status: VisibilityAssignmentRecord["status"]) {
  if (status === "active") {
    return "success" as const;
  }

  if (status === "scheduled") {
    return "warning" as const;
  }

  return "neutral" as const;
}

export function VisibilityAssignmentsPanel({
  assignments,
}: VisibilityAssignmentsPanelProps) {
  if (!assignments.length) {
    return (
      <EmptyState
        title="No visibility assignments yet"
        description="Create scheduled label assignments for brands and services once the backend starts returning operational records."
      />
    );
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold text-[var(--color-ink)]">
        Active and scheduled assignments
      </h2>
      <div className="mt-6 grid gap-3">
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="rounded-[20px] bg-[var(--color-surface)] p-4"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-[var(--color-ink)]">
                    {assignment.label}
                  </p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs capitalize text-[var(--color-ink-muted)]">
                    {assignment.targetType}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                  {assignment.targetName} · {formatDateRange(assignment.startsAt, assignment.endsAt)}
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-ink-muted)]">
                  {assignment.note}
                </p>
              </div>
              <StatusPill
                label={assignment.status}
                tone={getAssignmentTone(assignment.status)}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
