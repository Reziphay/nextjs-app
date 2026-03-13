import { notFound } from "next/navigation";

import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { ReportActionForm } from "@/features/admin-reports/report-action-form";
import { getReportById } from "@/lib/api/admin";
import { formatShortDate } from "@/lib/utils/format";

type ReportDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
  const { id } = await params;
  const report = await getReportById(id);

  if (!report) {
    notFound();
  }

  return (
    <>
      <AdminTopbar
        title="Report detail"
        description="Inspect the target, evidence, and moderation context before taking action."
      />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
                {report.subject}
              </h2>
              <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                Submitted {formatShortDate(report.submittedAt)}
              </p>
            </div>
            <StatusPill
              label={report.status}
              tone={report.status === "resolved" ? "success" : "warning"}
            />
          </div>
          <div className="mt-8 grid gap-4 rounded-[22px] bg-[var(--color-surface)] p-5 text-sm leading-7 text-[var(--color-ink-muted)]">
            <p>Target type: {report.targetType}</p>
            <p>Priority: {report.priority}</p>
            <p>{report.reason}</p>
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-[var(--color-ink)]">Action panel</h3>
          <ReportActionForm />
        </Card>
      </div>
    </>
  );
}
