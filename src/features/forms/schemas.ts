import { z } from "zod";

export const contactFormSchema = z.object({
  fullName: z.string().min(2, "Enter your full name."),
  email: z.string().email("Enter a valid email address."),
  company: z.string().max(120).optional().or(z.literal("")),
  interest: z.enum([
    "app-download",
    "customer-support",
    "general",
    "provider-partnership",
  ]),
  message: z
    .string()
    .min(20, "Share enough detail so the team can follow up.")
    .max(1200, "Keep the message under 1200 characters."),
});

export const providerInterestSchema = z.object({
  fullName: z.string().min(2, "Enter your full name."),
  email: z.string().email("Enter a valid email address."),
  businessName: z.string().min(2, "Enter the business or brand name."),
  category: z.string().min(2, "Enter your service category."),
  city: z.string().min(2, "Enter your city or area."),
  teamSize: z.string().max(60).optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  details: z
    .string()
    .min(20, "Tell us how you want to use Reziphay.")
    .max(1200, "Keep the details under 1200 characters."),
});

export const analyticsEventSchema = z.object({
  name: z.string().min(1).max(120),
  path: z.string().min(1).max(240).optional(),
  properties: z
    .record(
      z.string(),
      z.union([z.string(), z.number(), z.boolean(), z.null()]),
    )
    .optional(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
export type ProviderInterestValues = z.infer<typeof providerInterestSchema>;
