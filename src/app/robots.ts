import type { MetadataRoute } from "next";

import { buildAdminPath } from "@/lib/auth/admin-auth";
import { siteConfig } from "@/lib/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [buildAdminPath()],
      },
    ],
    sitemap: `${siteConfig.appUrl}/sitemap.xml`,
  };
}
