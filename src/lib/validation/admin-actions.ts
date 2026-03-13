import { z } from "zod";

export const reportActionSchema = z.object({
  action: z.enum(["resolve", "dismiss", "escalate"]),
  reason: z.string().trim().min(10, "Add a concise moderation reason."),
});

export const userActionSchema = z.object({
  action: z.enum(["suspend", "close", "reopen"]),
  reason: z.string().trim().min(10, "Add an account action reason."),
});

export type ReportActionInput = z.infer<typeof reportActionSchema>;
export type UserActionInput = z.infer<typeof userActionSchema>;
