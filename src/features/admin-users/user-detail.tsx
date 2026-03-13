import Link from "next/link";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { UserActionForm } from "@/features/admin-users/user-action-form";
import type {
  BrandRecord,
  ReportRecord,
  ServiceRecord,
  UserAdminDetail,
  UserRecord,
} from "@/lib/types/admin";
import { formatShortDate } from "@/lib/utils/format";

type UserDetailProps =
  | { state: "loading" | "error" }
  | { state: "ready"; adminRoute: string; detail: UserAdminDetail };

function getUserTone(state: UserRecord["state"]) {
  if (state === "active") {
    return "success" as const;
  }

  if (state === "suspended") {
    return "warning" as const;
  }

  return "danger" as const;
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

export function UserDetailState(props: UserDetailProps) {
  if (props.state === "loading") {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-1/3 rounded-full bg-[var(--color-surface-strong)]" />
          <div className="h-24 rounded-[20px] bg-[var(--color-surface-strong)]" />
        </div>
      </Card>
    );
  }

  if (props.state === "error") {
    return (
      <EmptyState
        title="User data could not be loaded"
        description="The current backend configuration does not expose the admin user detail contract needed by this screen."
      />
    );
  }

  if (props.state !== "ready") {
    return null;
  }

  const {
    adminRoute,
    detail: { relatedBrands, relatedReports, relatedServices, user },
  } = props;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="grid gap-6">
        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
                {user.name}
              </h2>
              <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{user.id}</p>
              <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                Joined {formatShortDate(user.joinedAt)}
              </p>
            </div>
            <StatusPill label={user.state} tone={getUserTone(user.state)} />
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DetailMetric
              label="Roles"
              value={user.roles.join(", ")}
              hint="Single-account role mix is preserved across the product."
            />
            <DetailMetric
              label="Penalty points"
              value={String(user.penaltyPoints)}
              hint="Higher counts usually require direct account review."
            />
            <DetailMetric
              label="Completed reservations"
              value={String(user.completedReservations)}
              hint="Operational trust should be reviewed alongside penalties."
            />
            <DetailMetric
              label="Brands / services"
              value={`${user.brands} / ${user.services}`}
              hint="Linked operational scope across provider-facing surfaces."
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-[var(--color-ink)]">
            Linked brands
          </h3>
          {relatedBrands.length ? (
            <div className="mt-6 grid gap-3">
              {relatedBrands.map((brand) => (
                <div
                  key={brand.id}
                  className="rounded-[20px] bg-[var(--color-surface)] p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <Link
                        href={`/${adminRoute}/brands/${brand.id}`}
                        className="text-base font-semibold text-[var(--color-ink)] hover:text-[var(--color-primary)]"
                      >
                        {brand.name}
                      </Link>
                      <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                        {brand.members} members, {brand.services} services
                      </p>
                    </div>
                    <StatusPill label={brand.status} tone={getBrandTone(brand.status)} />
                  </div>
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
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <EmptyPanel
                title="No linked brand detail available"
                description={
                  user.brands > 0
                    ? "The current data source exposes summary counts for this user, but brand relationship detail is not available yet."
                    : "This account does not currently own or manage any brands."
                }
              />
            </div>
          )}
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
                        {service.category} · {service.brand} · {service.requestsToday} requests
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
                title="No linked service detail available"
                description={
                  user.services > 0
                    ? "The current data source exposes summary counts for this user, but service relationship detail is not available yet."
                    : "This account does not currently manage any services."
                }
              />
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-6 self-start">
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
                title="No direct reports"
                description="No user-targeted moderation cases are attached to this account right now."
              />
            </div>
          )}
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-[var(--color-ink)]">
            Admin actions
          </h3>
          <p className="mt-3 text-sm leading-7 text-[var(--color-ink-muted)]">
            Apply account actions with the user&apos;s operational scope, reservation history,
            and moderation context visible.
          </p>
          <UserActionForm userId={user.id} />
        </Card>
      </div>
    </div>
  );
}
