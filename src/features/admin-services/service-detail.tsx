import Link from "next/link";

import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { SponsorshipForm } from "@/features/admin-sponsorships/sponsorship-form";
import { VisibilityForm } from "@/features/admin-visibility/visibility-form";
import type {
  BrandRecord,
  ReportRecord,
  ServiceAdminDetail,
  ServiceRecord,
  UserRecord,
} from "@/lib/types/admin";
import { formatShortDate } from "@/lib/utils/format";

type ServiceDetailProps = {
  adminRoute: string;
  detail: ServiceAdminDetail;
};

function getServiceTone(state: ServiceRecord["status"]) {
  if (state === "active") {
    return "success" as const;
  }

  if (state === "paused") {
    return "warning" as const;
  }

  return "danger" as const;
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

function getReportTone(state: ReportRecord["status"]) {
  if (state === "resolved") {
    return "success" as const;
  }

  if (state === "dismissed") {
    return "neutral" as const;
  }

  return "warning" as const;
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
      <p className="mt-2 font-medium capitalize text-[var(--color-ink)]">{value}</p>
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

export function ServiceDetail({ adminRoute, detail }: ServiceDetailProps) {
  const { brand, provider, relatedReports, service } = detail;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="grid gap-6">
        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
                {service.name}
              </h2>
              <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{service.id}</p>
            </div>
            <StatusPill label={service.status} tone={getServiceTone(service.status)} />
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <DetailMetric
              label="Category"
              value={service.category}
              hint="Public discovery and moderation rules often depend on category."
            />
            <DetailMetric
              label="Reservation mode"
              value={service.reservationMode}
              hint="Flexible flow should stay aligned with provider operations."
            />
            <DetailMetric
              label="Requests today"
              value={String(service.requestsToday)}
              hint="Use demand context before pausing or promoting a service."
            />
            <DetailMetric
              label="Waiting time"
              value={`${service.waitingTimeMinutes} min`}
              hint="Displayed as the current operating expectation."
            />
            <DetailMetric
              label="Lead time"
              value={service.leadTimeLabel}
              hint="Captures how far ahead customers can coordinate requests."
            />
          </div>
          <div className="mt-8 rounded-[20px] bg-[var(--color-surface)] p-5">
            <p className="text-sm text-[var(--color-ink-muted)]">Active visibility labels</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(service.visibility.length ? service.visibility : ["No active labels"]).map(
                (label) => (
                  <span
                    key={label}
                    className="rounded-full bg-white px-3 py-1 text-xs text-[var(--color-ink-muted)]"
                  >
                    {label}
                  </span>
                ),
              )}
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-[var(--color-ink)]">
            Provider and brand context
          </h3>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[20px] bg-[var(--color-surface)] p-4">
              <p className="text-sm text-[var(--color-ink-muted)]">Provider account</p>
              {provider ? (
                <>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <Link
                      href={`/${adminRoute}/users/${provider.id}`}
                      className="font-medium text-[var(--color-ink)] hover:text-[var(--color-primary)]"
                    >
                      {provider.name}
                    </Link>
                    <StatusPill label={provider.state} tone={getUserTone(provider.state)} />
                  </div>
                  <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
                    {provider.roles.join(", ")} · {provider.penaltyPoints} penalty points ·{" "}
                    {provider.completedReservations} completed reservations
                  </p>
                </>
              ) : (
                <div className="mt-3">
                  <EmptyPanel
                    title="Provider detail unavailable"
                    description="This backend response does not yet include the linked provider record."
                  />
                </div>
              )}
            </div>

            <div className="rounded-[20px] bg-[var(--color-surface)] p-4">
              <p className="text-sm text-[var(--color-ink-muted)]">Brand context</p>
              {brand ? (
                <>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <Link
                      href={`/${adminRoute}/brands/${brand.id}`}
                      className="font-medium text-[var(--color-ink)] hover:text-[var(--color-primary)]"
                    >
                      {brand.name}
                    </Link>
                    <StatusPill label={brand.status} tone={getBrandTone(brand.status)} />
                  </div>
                  <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
                    {brand.owner} · {brand.members} members · {brand.responseReliability}
                  </p>
                </>
              ) : (
                <div className="mt-3">
                  <EmptyPanel
                    title="Brand detail unavailable"
                    description="This backend response does not yet include the linked brand record."
                  />
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-[var(--color-ink)]">
            Moderation context
          </h3>
          {relatedReports.length ? (
            <div className="mt-6 grid gap-3">
              {relatedReports.map((report) => (
                <div
                  key={report.id}
                  className="rounded-[20px] bg-[var(--color-surface)] p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <Link
                        href={`/${adminRoute}/reports/${report.id}`}
                        className="text-base font-semibold text-[var(--color-ink)] hover:text-[var(--color-primary)]"
                      >
                        {report.subject}
                      </Link>
                      <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                        {report.priority} priority · {formatShortDate(report.submittedAt)}
                      </p>
                    </div>
                    <StatusPill
                      label={report.status}
                      tone={getReportTone(report.status)}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <EmptyPanel
                title="No direct service reports"
                description="No moderation cases currently target this service directly."
              />
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-6 self-start">
        <VisibilityForm
          title="Assign visibility label"
          description="Create a scheduled label assignment for this service directly from the detail view."
          lockedTargetId={service.id}
          initialValues={{
            targetId: service.id,
            note: `Visibility review for ${service.name}.`,
          }}
        />
        <SponsorshipForm
          title="Create sponsored placement"
          description="Sponsored visibility stays separate from payments and should remain clearly operational."
          lockedTargetId={service.id}
          lockedTargetType="service"
          initialValues={{
            campaignName: `${service.name} spotlight`,
            targetId: service.id,
            targetType: "service",
            note: `Sponsored placement for ${service.name}.`,
          }}
        />
      </div>
    </div>
  );
}
