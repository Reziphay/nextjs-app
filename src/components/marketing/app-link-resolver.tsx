"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { siteConfig } from "@/config/site";
import { trackEvent } from "@/features/analytics/track";

import { CtaLink } from "@/components/marketing/cta-link";

export function AppLinkResolver() {
  const searchParams = useSearchParams();
  const [fallbackVisible, setFallbackVisible] = useState(false);

  const target = searchParams.get("to") || siteConfig.app.deepLink;
  const platform = searchParams.get("platform") || "unknown";

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setFallbackVisible(true);
    }, 1400);

    trackEvent("app_link_attempt", {
      platform,
      target,
    });

    window.location.href = target;

    return () => {
      window.clearTimeout(timeout);
    };
  }, [platform, target]);

  return (
    <div className="space-y-4 rounded-[1.75rem] border border-border/80 bg-card p-6 shadow-[var(--shadow-card)]">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-strong">
        Trying to open the app
      </p>
      <p className="text-sm leading-6 text-muted">
        If Reziphay is installed, the device should handle the deep link. If not,
        use the fallback buttons below.
      </p>
      {fallbackVisible ? (
        <div className="flex flex-wrap gap-3">
          <CtaLink
            analyticsEvent={{
              name: "download_section_interaction",
              properties: {
                destination: "/download",
                surface: "app-link-fallback",
              },
            }}
            href="/download"
          >
            Go to download flow
          </CtaLink>
          <CtaLink
            analyticsEvent={{
              name: "navigation_click",
              properties: {
                destination: "/contact?intent=app-launch",
                label: "Ask for launch updates",
                surface: "app-link-fallback",
              },
            }}
            href="/contact?intent=app-launch"
            variant="outline"
          >
            Ask for launch updates
          </CtaLink>
        </div>
      ) : null}
    </div>
  );
}
