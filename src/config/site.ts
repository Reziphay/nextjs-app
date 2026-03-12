export const siteConfig = {
  name: "Reziphay",
  shortName: "Reziphay",
  title: "Flexible reservations, built around real service workflows",
  description:
    "Reziphay is a mobile-first reservation platform for discovering services, comparing providers, and requesting bookings without forcing rigid calendars or payment lock-in.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://reziphay.com",
  ogImagePath: "/opengraph-image",
  supportEmail: "support@reziphay.com",
  contactEmail: "hello@reziphay.com",
  app: {
    iosUrl:
      process.env.NEXT_PUBLIC_APP_STORE_URL ??
      "/contact?intent=ios-launch-updates",
    androidUrl:
      process.env.NEXT_PUBLIC_PLAY_STORE_URL ??
      "/contact?intent=android-launch-updates",
    deepLink: process.env.NEXT_PUBLIC_APP_DEEP_LINK ?? "reziphay://open",
  },
  analytics: {
    gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "",
  },
} as const;

export type Platform = "android" | "ios";

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, siteConfig.url).toString();
}

export function getDownloadHref(platform: Platform) {
  return platform === "ios" ? siteConfig.app.iosUrl : siteConfig.app.androidUrl;
}

