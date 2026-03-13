import { z } from "zod";

export const visibilityLabelSchema = z.object({
  label: z.string().trim().min(3, "Label name is required."),
  targetType: z.enum(["brand", "service", "user"]),
  targetId: z.string().trim().min(3, "Choose a target."),
  startsAt: z.string().trim().min(1, "Choose a start date."),
  endsAt: z.string().trim().min(1, "Choose an end date."),
  note: z.string().trim().min(10, "Add a short operator note."),
});

export type VisibilityLabelInput = z.infer<typeof visibilityLabelSchema>;
