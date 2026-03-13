import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Card } from "@/components/ui/card";
import { SponsorshipForm } from "@/features/admin-sponsorships/sponsorship-form";

export default function SponsoredVisibilityPage() {
  return (
    <>
      <AdminTopbar
        title="Sponsored visibility"
        description="Keep sponsored placements separate from payments while preserving target, timing, and notes."
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <SponsorshipForm />
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">
            Campaign snapshot
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-ink-muted)]">
            <li>Home feed spotlight · Calm Studio · Ends in 6 days</li>
            <li>Near-to-me highlight · Precision fade · 12.4k views</li>
          </ul>
        </Card>
      </div>
    </>
  );
}
