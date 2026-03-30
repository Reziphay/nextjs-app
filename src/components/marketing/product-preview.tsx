import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";

export function ProductPreview() {
  return (
    <div className="relative">
      <div className="absolute left-8 top-6 h-56 w-56 rounded-full bg-[var(--color-primary-soft)] blur-3xl" />
      <div className="absolute bottom-0 right-4 h-44 w-44 rounded-full bg-[var(--color-secondary-soft)] blur-3xl" />
      <div className="relative grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(242,242,247,0.92)_100%)] p-0">
          <div className="border-b border-[var(--color-border)] px-6 py-5">
            <p className="text-sm font-semibold text-[var(--color-ink)]">
              Customer discovery
            </p>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              Clear service scanning, flexible availability, and calm trust cues.
            </p>
            <div className="mt-4 flex items-center gap-3 rounded-[16px] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-ink-muted)]">
              <span className="text-[var(--color-primary)]">⌕</span>
              Search for a service or brand...
            </div>
          </div>
          <div className="grid gap-4 p-6">
            {[
              {
                title: "Precision fade",
                subtitle: "Calm Studio · 4.9 rating",
                pill: "2.3 km",
              },
              {
                title: "Emergency dentist consult",
                subtitle: "North Dental Lab · Manual approval",
                pill: "Pending review",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-paper)] p-4 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-[var(--color-ink)]">{item.title}</p>
                    <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                      {item.subtitle}
                    </p>
                  </div>
                  <StatusPill label={item.pill} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="border-white/10 bg-[linear-gradient(180deg,#17171c_0%,#1f1f28_100%)] text-[var(--color-paper)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
            Hidden admin
          </p>
          <div className="mt-6 space-y-4">
            <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/70">Open reports</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.03em]">
                42
              </p>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">Visibility labels</p>
                <StatusPill label="Active" tone="success" />
              </div>
              <p className="mt-2 text-sm text-white/70">
                Featured, VIP, and best-of-month assignments remain auditable and calm.
              </p>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/70">Business onboarding</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="h-2 flex-1 rounded-full bg-white/10">
                  <span className="block h-2 w-[72%] rounded-full bg-[var(--color-secondary)]" />
                </span>
                <span className="text-xs font-medium text-white/72">72%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
