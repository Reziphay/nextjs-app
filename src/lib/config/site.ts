import type { Metadata } from "next";

import { publicEnv } from "@/lib/config/env";

export const siteConfig = {
  name: "Reziphay",
  description:
    "Flexible reservations for people who need trusted service discovery and providers who need control over their own workflow.",
  shortDescription:
    "Flexible reservations without rigid calendar theater.",
  appUrl: publicEnv.NEXT_PUBLIC_APP_URL,
  apiBaseUrl: publicEnv.NEXT_PUBLIC_API_BASE_URL,
  iosUrl: publicEnv.NEXT_PUBLIC_DOWNLOAD_IOS_URL,
  androidUrl: publicEnv.NEXT_PUBLIC_DOWNLOAD_ANDROID_URL,
  contactEmail: publicEnv.NEXT_PUBLIC_CONTACT_EMAIL,
};

type MetadataOptions = {
  title: string;
  description: string;
  path?: string;
};

export function buildMetadata({
  title,
  description,
  path = "/",
}: MetadataOptions): Metadata {
  const canonical = new URL(path, siteConfig.appUrl).toString();

  return {
    title: `${title} | ${siteConfig.name}`,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
