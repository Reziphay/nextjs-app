import type { MetadataRoute } from "next";

import {
  blogPosts,
  featuredCategories,
  featuredCities,
} from "@/content/site";
import { absoluteUrl } from "@/config/site";

const staticRoutes = [
  "/",
  "/features",
  "/for-customers",
  "/for-providers",
  "/how-it-works",
  "/faq",
  "/contact",
  "/about",
  "/privacy",
  "/terms",
  "/blog",
  "/download",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-03-12T00:00:00.000Z");

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route),
      lastModified,
    })),
    ...featuredCategories.map((category) => ({
      url: absoluteUrl(`/categories/${category.slug}`),
      lastModified,
    })),
    ...featuredCities.map((city) => ({
      url: absoluteUrl(`/cities/${city.slug}`),
      lastModified,
    })),
    ...blogPosts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: new Date(`${post.publishedAt}T00:00:00.000Z`),
    })),
  ];
}

