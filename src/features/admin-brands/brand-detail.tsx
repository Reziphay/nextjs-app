import Link from "next/link";

import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { SponsorshipForm } from "@/features/admin-sponsorships/sponsorship-form";
import { VisibilityForm } from "@/features/admin-visibility/visibility-form";
import type {
  BrandAdminDetail,
  BrandRecord,
  ReportRecord,
  ServiceRecord,
} from "@/lib/types/admin";
import { formatShortDate } from "@/lib/utils/format";

type BrandDetailProps = {
  adminRoute: string;
  detail: BrandAdminDetail;
};

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

export function BrandDetail({ adminRoute, detail }: BrandDetailProps) {
  const { brand, relatedReports, relatedServices } = detail;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="grid gap-6">
        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
                {brand.name}
              </h2>
              <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{brand.id}</p>
            </div>
            <StatusPill label={brand.status} tone={getBrandTone(brand.status)} />
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DetailMetric
              label="Owner"
              value={brand.owner}
              hint="Brand ownership should align with provider identity records."
            />
            <DetailMetric
              label="Members"
              value={String(brand.members)}
              hint="Use membership context when reviewing visibility or abuse risk."
            />
            <DetailMetric
              label="Services"
              value={String(brand.services)}
              hint="Service count reflects the brand's current operational scope."
            />
            <DetailMetric
              label="Response reliability"
              value={brand.responseReliability}
              hint="A key signal for trust and provider quality."
            />
          </div>
          <div className="mt-8 rounded-[20px] bg-[var(--color-surface)] p-5">
            <p className="text-sm text-[var(--color-ink-muted)]">Active visibility labels</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(brand.visibility.length ? brand.visibility : ["No active labels"]).map(
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
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-ink)]">
                Ownership and team
              </h3>
              <p className="mt-2 text-sm leading-7 text-[var(--color-ink-muted)]">
                Check ownership and member overlap before approving visibility changes.
              </p>
            </div>
            <Link
              href={`/${adminRoute}/users/${brand.ownerId}`}
              className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-strong)]"
            >
              Open owner account
            </Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {brand.memberNames.map((memberName) => (
              <div
                key={memberName}
                className="rounded-[20px] bg-[var(--color-surface)] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-[var(--color-ink)]">{memberName}</p>
                  {memberName === brand.owner ? (
                    <span className="rounded-full bg-white px-3 py-1 text-xs text-[var(--color-ink-muted)]">
                      Owner
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-[var(--color-ink)]">
            Linked services
          </h3>
          {relatedServices.length ? (
            <div className="mt-6 grid gap-3">
              {relatedServices.map((service) => (
                <div
                  key={service.id}
                  className="rounded-[20px] bg-[var(--color-surface)] p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <Link
                        href={`/${adminRoute}/services/${service.id}`}
                        className="text-base font-semibold text-[var(--color-ink)] hover:text-[var(--color-primary)]"
                      >
                        {service.name}
                      </Link>
                      <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                        {service.category} · {service.provider} · {service.requestsToday} requests
                        today
                      </p>
                    </div>
                    <StatusPill
                      label={service.status}
                      tone={getServiceTone(service.status)}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <EmptyPanel
                title="No service detail available"
                description={
                  brand.services > 0
                    ? "The current data source exposes service counts for this brand, but the linked service detail response is not available yet."
                    : "This brand does not currently expose any services."
                }
              />
            </div>
          )}
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
                title="No direct brand reports"
                description="No moderation cases currently target this brand directly."
              />
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-6 self-start">
        <VisibilityForm
          title="Assign visibility label"
          description="Create a scheduled label assignment for this brand without leaving the detail view."
          lockedTargetId={brand.id}
          lockedTargetType="brand"
          initialValues={{
            targetId: brand.id,
            targetType: "brand",
            note: `Visibility review for ${brand.name}.`,
          }}
        />
        <SponsorshipForm
          title="Create sponsored placement"
          description="Sponsored visibility remains operational tooling, not a consumer payment flow."
          lockedTargetId={brand.id}
          lockedTargetType="brand"
          initialValues={{
            campaignName: `${brand.name} spotlight`,
            targetId: brand.id,
            targetType: "brand",
            note: `Sponsored placement for ${brand.name}.`,
          }}
        />
      </div>
    </div>
  );
}
