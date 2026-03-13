import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import type { SponsorshipCampaignRecord } from "@/lib/types/admin";
import { formatDateRange } from "@/lib/utils/format";

type SponsorshipCampaignsPanelProps = {
  campaigns: SponsorshipCampaignRecord[];
};

function getCampaignTone(status: SponsorshipCampaignRecord["status"]) {
  if (status === "active") {
    return "success" as const;
  }

  if (status === "scheduled") {
    return "warning" as const;
  }

  return "neutral" as const;
}

export function SponsorshipCampaignsPanel({
  campaigns,
}: SponsorshipCampaignsPanelProps) {
  if (!campaigns.length) {
    return (
      <EmptyState
        title="No sponsored campaigns yet"
        description="The sponsored visibility surface is ready for live campaign records when the backend starts returning them."
      />
    );
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold text-[var(--color-ink)]">
        Campaign snapshot
      </h2>
      <div className="mt-6 grid gap-3">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="rounded-[20px] bg-[var(--color-surface)] p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-[var(--color-ink)]">
                    {campaign.campaignName}
                  </p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs capitalize text-[var(--color-ink-muted)]">
                    {campaign.targetType}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                  {campaign.targetName} · {formatDateRange(campaign.startsAt, campaign.endsAt)}
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-ink-muted)]">
                  {campaign.note}
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--color-ink)]">
                  {campaign.performanceLabel}
                </p>
              </div>
              <StatusPill label={campaign.status} tone={getCampaignTone(campaign.status)} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
