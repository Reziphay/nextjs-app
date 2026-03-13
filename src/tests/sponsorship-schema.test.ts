import { sponsorshipSchema } from "@/lib/validation/sponsorship";

describe("sponsorshipSchema", () => {
  it("rejects invalid sponsorship payloads", () => {
    const result = sponsorshipSchema.safeParse({
      campaignName: "",
      targetType: "invalid",
      targetId: "",
      startsAt: "",
      endsAt: "",
      note: "",
    });

    expect(result.success).toBe(false);
  });
});
