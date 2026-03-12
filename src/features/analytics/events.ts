export interface AnalyticsEventMap {
  page_view: {
    pathname: string;
  };
  hero_cta_click: {
    surface: string;
    ctaLabel: string;
    destination: string;
  };
  app_store_click: {
    surface: string;
    href: string;
  };
  play_store_click: {
    surface: string;
    href: string;
  };
  provider_interest_submit: {
    category: string;
    city: string;
  };
  contact_submit: {
    interest: string;
  };
  faq_expand: {
    question: string;
    surface: string;
  };
  pricing_or_visibility_interest_click: {
    surface: string;
    destination: string;
  };
  download_section_interaction: {
    surface: string;
    destination: string;
    platform?: "android" | "ios";
  };
  category_page_view: {
    slug: string;
    name: string;
  };
  city_page_view: {
    slug: string;
    name: string;
  };
  blog_article_view: {
    slug: string;
    title: string;
    category: string;
  };
  navigation_click: {
    surface: string;
    label: string;
    destination: string;
  };
  app_link_attempt: {
    platform: string;
    target: string;
  };
}

export type AnalyticsEventName = keyof AnalyticsEventMap;

export type AnalyticsEventDescriptor = {
  [K in AnalyticsEventName]: {
    name: K;
    properties: AnalyticsEventMap[K];
  };
}[AnalyticsEventName];

export const analyticsEventNames = [
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
  "navigation_click",
  "app_link_attempt",
] as const satisfies readonly AnalyticsEventName[];
