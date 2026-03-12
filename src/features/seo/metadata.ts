import type { Metadata } from "next";

import { absoluteUrl, siteConfig } from "@/config/site";

interface MetadataOptions {
  title?: string;
  description: string;
  path?: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
}

export function createMetadata({
  title,
  description,
  path = "/",
  keywords = [],
  image,
  noIndex = false,
}: MetadataOptions): Metadata {
  const canonical = absoluteUrl(path);
  const socialImage = absoluteUrl(image ?? siteConfig.ogImagePath);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: title ? `${title} | ${siteConfig.name}` : siteConfig.title,
      description,
      url: canonical,
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title ? `${title} | ${siteConfig.name}` : siteConfig.title,
      description,
      images: [socialImage],
    },
  };
}

