import { z } from "zod";

export const providerInquirySchema = z.object({
  contactName: z.string().trim().min(2, "Enter a contact name."),
  businessName: z.string().trim().min(2, "Enter your business or brand name."),
  email: z.email("Enter a valid business email."),
  phone: z.string().trim().min(7, "Enter a valid phone number."),
  sector: z.string().trim().min(2, "Choose a sector."),
  message: z
    .string()
    .trim()
    .min(24, "Add enough detail about your current reservation workflow."),
});

export type ProviderInquiryInput = z.infer<typeof providerInquirySchema>;
