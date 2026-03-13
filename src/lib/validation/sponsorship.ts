import { z } from "zod";

export const sponsorshipSchema = z.object({
  campaignName: z.string().trim().min(3, "Campaign name is required."),
  targetType: z.enum(["service", "brand"]),
  targetId: z.string().trim().min(3, "Choose a target."),
  startsAt: z.string().trim().min(1, "Choose a start date."),
  endsAt: z.string().trim().min(1, "Choose an end date."),
  note: z.string().trim().min(10, "Add an operator note."),
});

export type SponsorshipInput = z.infer<typeof sponsorshipSchema>;
