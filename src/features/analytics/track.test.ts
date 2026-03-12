import { describe, expect, it } from "vitest";

import { analyticsEventNames } from "@/features/analytics/events";
import { buildTrackingPayload } from "@/features/analytics/track";

describe("analytics tracking", () => {
  it("includes the required marketing event names", () => {
    expect(analyticsEventNames).toEqual(
      expect.arrayContaining([
        "page_view",
        "hero_cta_click",
        "app_store_click",
        "play_store_click",
        "provider_interest_submit",
        "contact_submit",
        "faq_expand",
        "pricing_or_visibility_interest_click",
        "download_section_interaction",
        "category_page_view",
        "city_page_view",
        "blog_article_view",
      ]),
    );
  });

  it("builds a normalized tracking payload", () => {
    const payload = buildTrackingPayload(
      "hero_cta_click",
      {
        ctaLabel: "Download flow",
        destination: "/download",
        surface: "home-hero",
      },
      "/",
    );

    expect(payload).toEqual({
      name: "hero_cta_click",
      path: "/",
      properties: {
        ctaLabel: "Download flow",
        destination: "/download",
        surface: "home-hero",
      },
    });
  });
});

