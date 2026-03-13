import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import type { AdminBackendReadiness } from "@/lib/config/admin-readiness";
import { formatDateTime } from "@/lib/utils/format";

type BackendReadinessProps = {
  readiness: AdminBackendReadiness;
};

function getProbeTone(status: keyof AdminBackendReadiness["counts"]) {
  if (status === "ready") {
    return "success" as const;
  }

  if (status === "unauthorized") {
    return "warning" as const;
  }

  if (status === "missing" || status === "failing") {
    return "danger" as const;
  }

  return "neutral" as const;
}

export function BackendReadiness({ readiness }: BackendReadinessProps) {
  return (
    <Card>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">
            Backend readiness probes
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--color-ink-muted)]">
            Read-only endpoint checks for the current backend contract. Auth and mutation
            routes are not triggered here.
          </p>
        </div>
        <p className="text-sm text-[var(--color-ink-faint)]">
          Checked {formatDateTime(readiness.checkedAt)}
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-5">
        {(Object.entries(readiness.counts) as Array<
          [keyof AdminBackendReadiness["counts"], number]
        >).map(([status, count]) => (
          <div key={status} className="rounded-[20px] bg-[var(--color-surface)] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm capitalize text-[var(--color-ink-muted)]">{status}</p>
              <StatusPill label={status} tone={getProbeTone(status)} />
            </div>
            <p className="mt-3 text-2xl font-semibold text-[var(--color-ink)]">{count}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3">
        {readiness.probes.map((probe) => (
          <div key={probe.label} className="rounded-[20px] bg-[var(--color-surface)] p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-[var(--color-ink)]">{probe.label}</p>
                  <StatusPill label={probe.status} tone={getProbeTone(probe.status)} />
                </div>
                <p className="mt-2 break-all font-mono text-sm text-[var(--color-ink-muted)]">
                  {probe.path}
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-ink-muted)]">
                  {probe.detail}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
