import Link from "next/link";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { formatShortDate } from "@/lib/utils/format";
import type { ReportRecord } from "@/lib/types/admin";

type ReportsTableProps = {
  records: ReportRecord[];
  adminRoute: string;
};

export function ReportsTable({ adminRoute, records }: ReportsTableProps) {
  if (!records.length) {
    return (
      <EmptyState
        title="No reports match this filter"
        description="Try a broader query or clear the status constraints."
      />
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-[var(--color-surface)] text-[var(--color-ink-muted)]">
          <tr>
            <th className="px-6 py-4 font-medium">Subject</th>
            <th className="px-6 py-4 font-medium">Target</th>
            <th className="px-6 py-4 font-medium">Status</th>
            <th className="px-6 py-4 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} className="border-t border-[var(--color-border)]">
              <td className="px-6 py-4">
                <Link
                  href={`/${adminRoute}/reports/${record.id}`}
                  className="font-medium text-[var(--color-ink)] hover:text-[var(--color-primary)]"
                >
                  {record.subject}
                </Link>
                <p className="mt-1 text-xs text-[var(--color-ink-faint)]">
                  {record.reporterLabel}
                </p>
              </td>
              <td className="px-6 py-4 capitalize text-[var(--color-ink-muted)]">
                {record.targetType}
              </td>
              <td className="px-6 py-4">
                <StatusPill
                  label={record.status}
                  tone={
                    record.status === "resolved"
                      ? "success"
                      : record.status === "open"
                        ? "danger"
                        : "warning"
                  }
                />
              </td>
              <td className="px-6 py-4 text-[var(--color-ink-muted)]">
                {formatShortDate(record.submittedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
