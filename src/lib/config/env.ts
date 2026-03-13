import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_API_BASE_URL: z.url().default("http://localhost:4000"),
  NEXT_PUBLIC_USE_MOCK_DATA: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  NEXT_PUBLIC_DOWNLOAD_IOS_URL: z
    .url()
    .default("https://apps.apple.com/app/id000000000"),
  NEXT_PUBLIC_DOWNLOAD_ANDROID_URL: z
    .url()
    .default("https://play.google.com/store/apps/details?id=com.reziphay.app"),
  NEXT_PUBLIC_CONTACT_EMAIL: z.email().default("hello@reziphay.com"),
});

const serverEnvSchema = z.object({
  ADMIN_ROUTE_SEGMENT: z
    .string()
    .trim()
    .min(3)
    .regex(/^[a-z0-9-]+$/)
    .default("operator"),
  ADMIN_AUTH_MODE: z.enum(["mock", "remote"]).default("mock"),
  ADMIN_AUTH_LOGIN_PATH: z.string().trim().min(1).default("/admin/auth/login"),
  ADMIN_AUTH_LOGOUT_PATH: z.string().trim().min(1).default("/admin/auth/logout"),
  ADMIN_LOGIN_EMAIL: z.email().default("ops@reziphay.local"),
  ADMIN_LOGIN_PASSWORD: z.string().min(8).default("reziphay-admin"),
});

export const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_USE_MOCK_DATA: process.env.NEXT_PUBLIC_USE_MOCK_DATA,
  NEXT_PUBLIC_DOWNLOAD_IOS_URL: process.env.NEXT_PUBLIC_DOWNLOAD_IOS_URL,
  NEXT_PUBLIC_DOWNLOAD_ANDROID_URL:
    process.env.NEXT_PUBLIC_DOWNLOAD_ANDROID_URL,
  NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
});

export const serverEnv = serverEnvSchema.parse({
  ADMIN_ROUTE_SEGMENT: process.env.ADMIN_ROUTE_SEGMENT,
  ADMIN_AUTH_MODE: process.env.ADMIN_AUTH_MODE,
  ADMIN_AUTH_LOGIN_PATH: process.env.ADMIN_AUTH_LOGIN_PATH,
  ADMIN_AUTH_LOGOUT_PATH: process.env.ADMIN_AUTH_LOGOUT_PATH,
  ADMIN_LOGIN_EMAIL: process.env.ADMIN_LOGIN_EMAIL,
  ADMIN_LOGIN_PASSWORD: process.env.ADMIN_LOGIN_PASSWORD,
});
