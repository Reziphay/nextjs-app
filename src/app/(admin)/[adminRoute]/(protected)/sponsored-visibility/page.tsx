import { AdminTopbar } from "@/components/admin/admin-topbar";
import { SponsorshipCampaignsPanel } from "@/features/admin-sponsorships/sponsorship-campaigns";
import { SponsorshipForm } from "@/features/admin-sponsorships/sponsorship-form";
import { getSponsorshipCampaigns } from "@/lib/api/admin";

export default async function SponsoredVisibilityPage() {
  const campaigns = await getSponsorshipCampaigns();

  return (
    <>
      <AdminTopbar
        title="Sponsored visibility"
        description="Keep sponsored placements separate from payments while preserving target, timing, and notes."
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <SponsorshipForm />
        <SponsorshipCampaignsPanel campaigns={campaigns} />
      </div>
    </>
  );
}
