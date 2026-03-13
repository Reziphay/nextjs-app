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
  ADMIN_OVERVIEW_PATH: z.string().trim().min(1).default("/admin/overview"),
  ADMIN_REPORTS_PATH: z.string().trim().min(1).default("/admin/reports"),
  ADMIN_REPORT_DETAIL_PATH: z
    .string()
    .trim()
    .min(1)
    .default("/admin/reports/:id"),
  ADMIN_REPORT_ACTION_PATH: z
    .string()
    .trim()
    .min(1)
    .default("/admin/reports/:id/resolve"),
  ADMIN_USERS_PATH: z.string().trim().min(1).default("/admin/users"),
  ADMIN_USER_DETAIL_PATH: z
    .string()
    .trim()
    .min(1)
    .default("/admin/users/:id"),
  ADMIN_USER_ADMIN_DETAIL_PATH: z
    .string()
    .trim()
    .min(1)
    .default("/admin/users/:id/detail"),
  ADMIN_USER_ACTION_PATH: z
    .string()
    .trim()
    .min(1)
    .default("/admin/users/:id/:action"),
  ADMIN_BRANDS_PATH: z.string().trim().min(1).default("/admin/brands"),
  ADMIN_BRAND_DETAIL_PATH: z
    .string()
    .trim()
    .min(1)
    .default("/admin/brands/:id"),
  ADMIN_BRAND_ADMIN_DETAIL_PATH: z
    .string()
    .trim()
    .min(1)
    .default("/admin/brands/:id/detail"),
  ADMIN_SERVICES_PATH: z.string().trim().min(1).default("/admin/services"),
  ADMIN_SERVICE_DETAIL_PATH: z
    .string()
    .trim()
    .min(1)
    .default("/admin/services/:id"),
  ADMIN_SERVICE_ADMIN_DETAIL_PATH: z
    .string()
    .trim()
    .min(1)
    .default("/admin/services/:id/detail"),
  ADMIN_ANALYTICS_OVERVIEW_PATH: z
    .string()
    .trim()
    .min(1)
    .default("/admin/analytics/overview"),
  ADMIN_VISIBILITY_LABELS_PATH: z
    .string()
    .trim()
    .min(1)
    .default("/admin/visibility-labels"),
  ADMIN_VISIBILITY_LABEL_ASSIGN_PATH: z
    .string()
    .trim()
    .min(1)
    .default("/admin/visibility-labels/:id/assign"),
  ADMIN_SPONSORED_VISIBILITY_PATH: z
    .string()
    .trim()
    .min(1)
    .default("/admin/sponsored-visibility"),
  ADMIN_ACTIVITY_PATH: z.string().trim().min(1).default("/admin/activity"),
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
  ADMIN_OVERVIEW_PATH: process.env.ADMIN_OVERVIEW_PATH,
  ADMIN_REPORTS_PATH: process.env.ADMIN_REPORTS_PATH,
  ADMIN_REPORT_DETAIL_PATH: process.env.ADMIN_REPORT_DETAIL_PATH,
  ADMIN_REPORT_ACTION_PATH: process.env.ADMIN_REPORT_ACTION_PATH,
  ADMIN_USERS_PATH: process.env.ADMIN_USERS_PATH,
  ADMIN_USER_DETAIL_PATH: process.env.ADMIN_USER_DETAIL_PATH,
  ADMIN_USER_ADMIN_DETAIL_PATH: process.env.ADMIN_USER_ADMIN_DETAIL_PATH,
  ADMIN_USER_ACTION_PATH: process.env.ADMIN_USER_ACTION_PATH,
  ADMIN_BRANDS_PATH: process.env.ADMIN_BRANDS_PATH,
  ADMIN_BRAND_DETAIL_PATH: process.env.ADMIN_BRAND_DETAIL_PATH,
  ADMIN_BRAND_ADMIN_DETAIL_PATH: process.env.ADMIN_BRAND_ADMIN_DETAIL_PATH,
  ADMIN_SERVICES_PATH: process.env.ADMIN_SERVICES_PATH,
  ADMIN_SERVICE_DETAIL_PATH: process.env.ADMIN_SERVICE_DETAIL_PATH,
  ADMIN_SERVICE_ADMIN_DETAIL_PATH: process.env.ADMIN_SERVICE_ADMIN_DETAIL_PATH,
  ADMIN_ANALYTICS_OVERVIEW_PATH: process.env.ADMIN_ANALYTICS_OVERVIEW_PATH,
  ADMIN_VISIBILITY_LABELS_PATH: process.env.ADMIN_VISIBILITY_LABELS_PATH,
  ADMIN_VISIBILITY_LABEL_ASSIGN_PATH:
    process.env.ADMIN_VISIBILITY_LABEL_ASSIGN_PATH,
  ADMIN_SPONSORED_VISIBILITY_PATH: process.env.ADMIN_SPONSORED_VISIBILITY_PATH,
  ADMIN_ACTIVITY_PATH: process.env.ADMIN_ACTIVITY_PATH,
  ADMIN_LOGIN_EMAIL: process.env.ADMIN_LOGIN_EMAIL,
  ADMIN_LOGIN_PASSWORD: process.env.ADMIN_LOGIN_PASSWORD,
});
