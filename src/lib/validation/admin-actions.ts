import { z } from "zod";

const reportReasonSchema = z
  .string()
  .trim()
  .min(10, "Add a concise moderation reason.");
const userReasonSchema = z
  .string()
  .trim()
  .min(10, "Add an account action reason.");

const suspendUserActionSchema = z.object({
  action: z.literal("suspend"),
  durationDays: z.coerce
    .number()
    .int("Use a whole number of days.")
    .min(1, "Use at least 1 day.")
    .max(365, "Use 365 days or fewer."),
  reason: userReasonSchema,
});

const closeUserActionSchema = z.object({
  action: z.literal("close"),
  reason: userReasonSchema,
});

export const reportActionSchema = z.object({
  action: z.enum(["resolve", "dismiss"]),
  reason: reportReasonSchema,
});

export const userActionSchema = z.discriminatedUnion("action", [
  suspendUserActionSchema,
  closeUserActionSchema,
]);

export const reportActionRequestSchema = reportActionSchema.extend({
  reportId: z.string().trim().min(3, "Report ID is required."),
});

export const userActionRequestSchema = z.discriminatedUnion("action", [
  suspendUserActionSchema.extend({
    userId: z.string().trim().min(3, "User ID is required."),
  }),
  closeUserActionSchema.extend({
    userId: z.string().trim().min(3, "User ID is required."),
  }),
]);

export type ReportActionInput = z.infer<typeof reportActionSchema>;
export type UserActionInput = z.infer<typeof userActionSchema>;
export type ReportActionRequestInput = z.infer<typeof reportActionRequestSchema>;
export type UserActionRequestInput = z.infer<typeof userActionRequestSchema>;
