import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";

export function ProductPreview() {
  return (
    <div className="relative">
      <div className="absolute inset-x-8 top-8 h-56 rounded-full bg-[var(--color-primary-soft)] blur-3xl" />
      <div className="relative grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f7f4ff_100%)] p-0">
          <div className="border-b border-[var(--color-border)] px-6 py-5">
            <p className="text-sm font-semibold text-[var(--color-ink)]">
              Customer discovery
            </p>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              Clear service scanning, flexible availability, and calm trust cues.
            </p>
          </div>
          <div className="grid gap-4 p-6">
            {[
              {
                title: "Precision fade",
                subtitle: "Calm Studio · 4.9 rating",
                pill: "Near to me",
              },
              {
                title: "Emergency dentist consult",
                subtitle: "North Dental Lab · Manual approval",
                pill: "Pending review",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[20px] border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-soft)]"
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
        <Card className="bg-[var(--color-ink)] text-[var(--color-paper)]">
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
          </div>
        </Card>
      </div>
    </div>
  );
}
