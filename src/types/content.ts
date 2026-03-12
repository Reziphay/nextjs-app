export type IconName =
  | "arrow-up-right"
  | "badge-check"
  | "bell-dot"
  | "building-2"
  | "calendar-clock"
  | "clipboard-list"
  | "clock-3"
  | "layers-3"
  | "map-pin"
  | "message-square"
  | "phone"
  | "route"
  | "scan-line"
  | "search"
  | "shield"
  | "sparkles"
  | "star"
  | "users";

export interface NavItem {
  title: string;
  href: string;
}

export interface PageHeroContent {
  eyebrow: string;
  title: string;
  description: string;
}

export interface StatItem {
  value: string;
  label: string;
  description: string;
}

export interface IconCardItem {
  icon: IconName;
  eyebrow?: string;
  title: string;
  description: string;
}

export interface TimelineStep {
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FeatureGroup {
  title: string;
  description: string;
  items: IconCardItem[];
}

export interface LegalSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface CategoryPageContent {
  slug: string;
  name: string;
  title: string;
  description: string;
  intro: string;
  benefits: string[];
  keywords: string[];
}

export interface CityPageContent {
  slug: string;
  name: string;
  title: string;
  description: string;
  intro: string;
  signals: string[];
  keywords: string[];
}

export interface BlogSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  readTime: string;
  sections: BlogSection[];
}

