import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  email: z.email("Enter a valid email address."),
  topic: z.string().trim().min(3, "Choose a topic."),
  message: z.string().trim().min(20, "Add enough detail for a useful reply."),
});

export type ContactInput = z.infer<typeof contactSchema>;
