import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import type { AdminIntegrationSnapshot } from "@/lib/config/admin-integration";
import { formatShortDate } from "@/lib/utils/format";

type IntegrationSettingsProps = {
  snapshot: AdminIntegrationSnapshot;
};

function getModeTone(mode: "mock" | "remote") {
  return mode === "remote" ? ("success" as const) : ("neutral" as const);
}

function getWarningTone(
  tone: AdminIntegrationSnapshot["warnings"][number]["tone"],
) {
  return tone;
}

export function IntegrationSettings({ snapshot }: IntegrationSettingsProps) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">
              Runtime posture
            </h2>
            <div className="flex flex-wrap gap-2">
              <StatusPill
                label={`Auth: ${snapshot.authMode}`}
                tone={getModeTone(snapshot.authMode)}
              />
              <StatusPill
                label={`Data: ${snapshot.dataMode}`}
                tone={getModeTone(snapshot.dataMode)}
              />
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[20px] bg-[var(--color-surface)] p-4">
              <p className="text-sm text-[var(--color-ink-muted)]">Admin route</p>
              <p className="mt-2 font-medium text-[var(--color-ink)]">
                /{snapshot.adminRoute}
              </p>
            </div>
            <div className="rounded-[20px] bg-[var(--color-surface)] p-4">
              <p className="text-sm text-[var(--color-ink-muted)]">API base URL</p>
              <p className="mt-2 break-all font-medium text-[var(--color-ink)]">
                {snapshot.apiBaseUrl}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">
              Session state
            </h2>
            <StatusPill
              label={snapshot.session.authenticated ? "authenticated" : "missing"}
              tone={snapshot.session.authenticated ? "success" : "warning"}
            />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[20px] bg-[var(--color-surface)] p-4">
              <p className="text-sm text-[var(--color-ink-muted)]">Session mode</p>
              <p className="mt-2 font-medium text-[var(--color-ink)]">
                {snapshot.session.mode ?? "No session"}
              </p>
            </div>
            <div className="rounded-[20px] bg-[var(--color-surface)] p-4">
              <p className="text-sm text-[var(--color-ink-muted)]">Access token</p>
              <p className="mt-2 font-medium text-[var(--color-ink)]">
                {snapshot.session.hasAccessToken ? "Present" : "Unavailable"}
              </p>
            </div>
            <div className="rounded-[20px] bg-[var(--color-surface)] p-4 md:col-span-2">
              <p className="text-sm text-[var(--color-ink-muted)]">Authenticated account</p>
              <p className="mt-2 font-medium text-[var(--color-ink)]">
                {snapshot.session.email ?? "Not available"}
              </p>
              {snapshot.session.expiresAt ? (
                <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                  Expires {formatShortDate(snapshot.session.expiresAt)}
                </p>
              ) : null}
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">
          Cutover warnings
        </h2>
        {snapshot.warnings.length ? (
          <div className="mt-6 grid gap-3">
            {snapshot.warnings.map((warning) => (
              <div
                key={warning.title}
                className="rounded-[20px] bg-[var(--color-surface)] p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-[var(--color-ink)]">{warning.title}</p>
                  <StatusPill
                    label={warning.tone}
                    tone={getWarningTone(warning.tone)}
                  />
                </div>
                <p className="mt-2 text-sm leading-7 text-[var(--color-ink-muted)]">
                  {warning.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-[20px] bg-[var(--color-surface)] p-4">
            <p className="font-medium text-[var(--color-ink)]">No active cutover warnings</p>
            <p className="mt-2 text-sm leading-7 text-[var(--color-ink-muted)]">
              Auth, data, and session posture are aligned for the current backend contract configuration.
            </p>
          </div>
        )}
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        {snapshot.groups.map((group) => (
          <Card key={group.title}>
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">
              {group.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--color-ink-muted)]">
              {group.description}
            </p>
            <div className="mt-6 grid gap-3">
              {group.endpoints.map((endpoint) => (
                <div
                  key={`${group.title}-${endpoint.label}`}
                  className="rounded-[20px] bg-[var(--color-surface)] p-4"
                >
                  <p className="text-sm text-[var(--color-ink-muted)]">{endpoint.label}</p>
                  <p className="mt-2 break-all font-mono text-sm text-[var(--color-ink)]">
                    {endpoint.path}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
