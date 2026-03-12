"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { trackEvent } from "@/features/analytics/track";

export function AnalyticsProvider() {
  const pathname = usePathname();

  useEffect(() => {
    trackEvent("page_view", {
      pathname,
    });
  }, [pathname]);

  return null;
}
