import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/config/site";

const paths = [
  "/",
  "/download",
  "/for-businesses",
  "/about",
  "/faq",
  "/contact",
  "/legal/terms",
  "/legal/privacy",
  "/legal/cookies",
  "/categories/barber",
  "/categories/dentist",
  "/categories/beauty",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((path) => ({
    url: new URL(path, siteConfig.appUrl).toString(),
    lastModified: new Date("2026-03-13T00:00:00.000Z"),
  }));
}
