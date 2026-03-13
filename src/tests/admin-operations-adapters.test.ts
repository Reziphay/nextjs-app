import {
  getActivityFeed,
  getSponsorshipCampaigns,
  getVisibilityAssignments,
} from "@/lib/api/admin";

describe("admin operations adapters", () => {
  it("returns visibility assignments and sponsorship campaigns in mock mode", async () => {
    const assignments = await getVisibilityAssignments();
    const campaigns = await getSponsorshipCampaigns();

    expect(assignments).toHaveLength(3);
    expect(assignments.some((assignment) => assignment.status === "active")).toBe(true);
    expect(campaigns).toHaveLength(3);
    expect(campaigns.some((campaign) => campaign.targetType === "service")).toBe(true);
  });

  it("returns the activity feed in chronological mock order", async () => {
    const items = await getActivityFeed();

    expect(items).toHaveLength(4);
    expect(items[0].category).toBe("moderation");
    expect(items[1].category).toBe("visibility");
  });
});
