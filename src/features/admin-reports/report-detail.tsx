import Link from "next/link";

import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { ReportActionForm } from "@/features/admin-reports/report-action-form";
import type {
  BrandRecord,
  ReportAdminDetail,
  ReportRecord,
  ServiceRecord,
  UserRecord,
} from "@/lib/types/admin";
import { formatDateTime, formatShortDate } from "@/lib/utils/format";

type ReportDetailProps = {
  adminRoute: string;
  detail: ReportAdminDetail;
};

function getReportTone(state: ReportRecord["status"]) {
  if (state === "resolved") {
    return "success" as const;
  }

  if (state === "dismissed") {
    return "neutral" as const;
  }

  return "warning" as const;
}

function getUserTone(state: UserRecord["state"]) {
  if (state === "active") {
    return "success" as const;
  }

  if (state === "suspended") {
    return "warning" as const;
  }

  return "danger" as const;
}

function getBrandTone(state: BrandRecord["status"]) {
  return state === "healthy" ? ("success" as const) : ("warning" as const);
}

function getServiceTone(state: ServiceRecord["status"]) {
  if (state === "active") {
    return "success" as const;
  }

  if (state === "paused") {
    return "warning" as const;
  }

  return "danger" as const;
}

function getTargetSurfaceLabel(targetType: ReportRecord["targetType"]) {
  if (targetType === "service") {
    return "Service listing";
  }

  if (targetType === "brand") {
    return "Brand profile";
  }

  if (targetType === "review") {
    return "Review thread";
  }

  return "User account";
}

function DetailMetric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-[20px] bg-[var(--color-surface)] p-4">
      <p className="text-sm text-[var(--color-ink-muted)]">{label}</p>
      <p className="mt-2 font-medium text-[var(--color-ink)]">{value}</p>
      {hint ? (
        <p className="mt-2 text-xs leading-6 text-[var(--color-ink-muted)]">{hint}</p>
      ) : null}
    </div>
  );
}

function EmptyPanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[20px] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <p className="font-medium text-[var(--color-ink)]">{title}</p>
      <p className="mt-2 text-sm leading-7 text-[var(--color-ink-muted)]">
        {description}
      </p>
    </div>
  );
}

export function ReportDetail({ adminRoute, detail }: ReportDetailProps) {
  const {
    relatedReports,
    report,
    serviceBrand,
    serviceProvider,
    targetBrand,
    targetService,
    targetUser,
  } = detail;
  const showsServiceContext =
    report.targetType === "service" || report.targetType === "review";

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="grid gap-6">
        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
                {report.subject}
              </h2>
              <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{report.id}</p>
            </div>
            <StatusPill label={report.status} tone={getReportTone(report.status)} />
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DetailMetric
              label="Reporter"
              value={report.reporterLabel}
              hint="Source quality helps calibrate confidence before action."
            />
            <DetailMetric
              label="Target surface"
              value={getTargetSurfaceLabel(report.targetType)}
              hint="Open the linked entity context before resolving or escalating."
            />
            <DetailMetric
              label="Priority"
              value={report.priority}
              hint="High-priority cases should be reviewed ahead of routine disputes."
            />
            <DetailMetric
              label="Submitted"
              value={formatDateTime(report.submittedAt)}
              hint="Response speed matters most for spam and impersonation cases."
            />
          </div>
          <div className="mt-8 rounded-[20px] bg-[var(--color-surface)] p-5">
            <p className="text-sm text-[var(--color-ink-muted)]">Reported issue</p>
            <p className="mt-3 text-sm leading-7 text-[var(--color-ink-muted)]">
              {report.reason}
            </p>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-[var(--color-ink)]">
            Target context
          </h3>
          <p className="mt-3 text-sm leading-7 text-[var(--color-ink-muted)]">
            Review the exact target and its operational status before closing the case.
          </p>
          <div className="mt-6">
            {report.targetType === "user" ? (
              targetUser ? (
                <div className="rounded-[20px] bg-[var(--color-surface)] p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm text-[var(--color-ink-muted)]">
                        Reported account
                      </p>
                      <Link
                        href={`/${adminRoute}/users/${targetUser.id}`}
                        className="mt-3 block text-base font-semibold text-[var(--color-ink)] hover:text-[var(--color-primary)]"
                      >
                        {targetUser.name}
                      </Link>
                      <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                        {targetUser.roles.join(", ")} · {targetUser.penaltyPoints} penalty
                        points · {targetUser.completedReservations} completed reservations
                      </p>
                    </div>
                    <StatusPill
                      label={targetUser.state}
                      tone={getUserTone(targetUser.state)}
                    />
                  </div>
                </div>
              ) : (
                <EmptyPanel
                  title="User detail unavailable"
                  description="This report still exists, but the linked account record is not currently exposed by the active data source."
                />
              )
            ) : null}

            {report.targetType === "brand" ? (
              targetBrand ? (
                <div className="rounded-[20px] bg-[var(--color-surface)] p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm text-[var(--color-ink-muted)]">
                        Reported brand
                      </p>
                      <Link
                        href={`/${adminRoute}/brands/${targetBrand.id}`}
                        className="mt-3 block text-base font-semibold text-[var(--color-ink)] hover:text-[var(--color-primary)]"
                      >
                        {targetBrand.name}
                      </Link>
                      <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                        {targetBrand.owner} · {targetBrand.members} members ·{" "}
                        {targetBrand.responseReliability}
                      </p>
                    </div>
                    <StatusPill
                      label={targetBrand.status}
                      tone={getBrandTone(targetBrand.status)}
                    />
                  </div>
                </div>
              ) : (
                <EmptyPanel
                  title="Brand detail unavailable"
                  description="This moderation case is attached to a brand target, but the linked brand record is not currently available from the backend response."
                />
              )
            ) : null}

            {showsServiceContext ? (
              targetService ? (
                <div className="rounded-[20px] bg-[var(--color-surface)] p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm text-[var(--color-ink-muted)]">
                        {report.targetType === "review"
                          ? "Review belongs to service"
                          : "Reported service"}
                      </p>
                      <Link
                        href={`/${adminRoute}/services/${targetService.id}`}
                        className="mt-3 block text-base font-semibold text-[var(--color-ink)] hover:text-[var(--color-primary)]"
                      >
                        {targetService.name}
                      </Link>
                      <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                        {targetService.category} · {targetService.brand} ·{" "}
                        {targetService.provider}
                      </p>
                    </div>
                    <StatusPill
                      label={targetService.status}
                      tone={getServiceTone(targetService.status)}
                    />
                  </div>
                </div>
              ) : (
                <EmptyPanel
                  title="Service detail unavailable"
                  description={
                    report.targetType === "review"
                      ? "The moderation case targets review content, but the linked service record is not currently exposed."
                      : "The report targets a service listing, but the linked service record is not currently exposed."
                  }
                />
              )
            ) : null}
          </div>
        </Card>

        {showsServiceContext ? (
          <Card>
            <h3 className="text-lg font-semibold text-[var(--color-ink)]">
              Provider and brand context
            </h3>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[20px] bg-[var(--color-surface)] p-4">
                <p className="text-sm text-[var(--color-ink-muted)]">Provider account</p>
                {serviceProvider ? (
                  <>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <Link
                        href={`/${adminRoute}/users/${serviceProvider.id}`}
                        className="font-medium text-[var(--color-ink)] hover:text-[var(--color-primary)]"
                      >
                        {serviceProvider.name}
                      </Link>
                      <StatusPill
                        label={serviceProvider.state}
                        tone={getUserTone(serviceProvider.state)}
                      />
                    </div>
                    <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
                      {serviceProvider.roles.join(", ")} · {serviceProvider.penaltyPoints}{" "}
                      penalty points · {serviceProvider.completedReservations} completed
                      reservations
                    </p>
                  </>
                ) : (
                  <div className="mt-3">
                    <EmptyPanel
                      title="Provider detail unavailable"
                      description="The linked provider record is not currently included in this response."
                    />
                  </div>
                )}
              </div>

              <div className="rounded-[20px] bg-[var(--color-surface)] p-4">
                <p className="text-sm text-[var(--color-ink-muted)]">Brand context</p>
                {serviceBrand ? (
                  <>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <Link
                        href={`/${adminRoute}/brands/${serviceBrand.id}`}
                        className="font-medium text-[var(--color-ink)] hover:text-[var(--color-primary)]"
                      >
                        {serviceBrand.name}
                      </Link>
                      <StatusPill
                        label={serviceBrand.status}
                        tone={getBrandTone(serviceBrand.status)}
                      />
                    </div>
                    <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
                      {serviceBrand.owner} · {serviceBrand.members} members ·{" "}
                      {serviceBrand.responseReliability}
                    </p>
                  </>
                ) : (
                  <div className="mt-3">
                    <EmptyPanel
                      title="Brand detail unavailable"
                      description="The linked brand record is not currently included in this response."
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>
        ) : null}
      </div>

      <div className="grid gap-6 self-start">
        <Card>
          <h3 className="text-lg font-semibold text-[var(--color-ink)]">Action panel</h3>
          <p className="mt-3 text-sm leading-7 text-[var(--color-ink-muted)]">
            Keep moderation decisions explicit and anchored to the linked account or
            listing context.
          </p>
          <ReportActionForm reportId={report.id} />
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-[var(--color-ink)]">
            Related moderation context
          </h3>
          {relatedReports.length ? (
            <div className="mt-6 grid gap-3">
              {relatedReports.map((relatedReport) => (
                <div
                  key={relatedReport.id}
                  className="rounded-[20px] bg-[var(--color-surface)] p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <Link
                        href={`/${adminRoute}/reports/${relatedReport.id}`}
                        className="text-base font-semibold text-[var(--color-ink)] hover:text-[var(--color-primary)]"
                      >
                        {relatedReport.subject}
                      </Link>
                      <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                        {relatedReport.priority} priority ·{" "}
                        {formatShortDate(relatedReport.submittedAt)}
                      </p>
                    </div>
                    <StatusPill
                      label={relatedReport.status}
                      tone={getReportTone(relatedReport.status)}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <EmptyPanel
                title="No additional cases on this target"
                description="This case is currently the only moderation record surfaced for the same target entity."
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
