import { z } from "zod";

export const reportActionSchema = z.object({
  action: z.enum(["resolve", "dismiss", "escalate"]),
  reason: z.string().trim().min(10, "Add a concise moderation reason."),
});

export const userActionSchema = z.object({
  action: z.enum(["suspend", "close", "reopen"]),
  reason: z.string().trim().min(10, "Add an account action reason."),
});

export const reportActionRequestSchema = reportActionSchema.extend({
  reportId: z.string().trim().min(3, "Report ID is required."),
});

export const userActionRequestSchema = userActionSchema.extend({
  userId: z.string().trim().min(3, "User ID is required."),
});

export type ReportActionInput = z.infer<typeof reportActionSchema>;
export type UserActionInput = z.infer<typeof userActionSchema>;
export type ReportActionRequestInput = z.infer<typeof reportActionRequestSchema>;
export type UserActionRequestInput = z.infer<typeof userActionRequestSchema>;
