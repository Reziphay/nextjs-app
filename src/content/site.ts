import type {
  BlogPost,
  CategoryPageContent,
  CityPageContent,
  FaqItem,
  FeatureGroup,
  IconCardItem,
  LegalSection,
  NavItem,
  PageHeroContent,
  StatItem,
  TimelineStep,
} from "@/types/content";

export const siteNavigation: NavItem[] = [
  { title: "Features", href: "/features" },
  { title: "For customers", href: "/for-customers" },
  { title: "For providers", href: "/for-providers" },
  { title: "How it works", href: "/how-it-works" },
  { title: "FAQ", href: "/faq" },
  { title: "Blog", href: "/blog" },
  { title: "Contact", href: "/contact" },
];

export const homeHero: PageHeroContent = {
  eyebrow: "Mobile-first reservation platform",
  title: "Help people find services faster and request bookings with less friction.",
  description:
    "Reziphay connects service seekers with providers across categories like beauty, health, wellness, consulting, and local services. The mobile app handles discovery and reservation requests. The website drives trust, demand, and provider growth.",
};

export const homeSignals: StatItem[] = [
  {
    value: "2-sided",
    label: "Customer and provider journeys",
    description:
      "The website speaks to both service seekers and service owners without pretending to be a full booking dashboard.",
  },
  {
    value: "Mobile-led",
    label: "Discovery and booking requests happen in-app",
    description:
      "Users explore services, compare providers, and request reservations through the mobile product.",
  },
  {
    value: "Flexible",
    label: "No forced slot-locking logic",
    description:
      "Providers keep control of approval windows, service modes, and workflow details instead of bending around a rigid calendar engine.",
  },
];

export const customerBenefits: IconCardItem[] = [
  {
    icon: "search",
    eyebrow: "Discover",
    title: "Search across service categories",
    description:
      "Find providers, services, brands, and locations with ranking signals like proximity, reviews, popularity, and availability.",
  },
  {
    icon: "map-pin",
    eyebrow: "Near you",
    title: "Start with location-aware discovery",
    description:
      "Highlight nearby options so users can compare what is relevant instead of scrolling through generic directories.",
  },
  {
    icon: "star",
    eyebrow: "Trust",
    title: "Read reviews grounded in completed reservations",
    description:
      "Ratings and comments follow actual completed experiences, which keeps social proof closer to real service quality.",
  },
  {
    icon: "calendar-clock",
    eyebrow: "Request",
    title: "Send reservation requests without guesswork",
    description:
      "Suggested times, provider-managed approval windows, and clear status updates keep the flow lightweight and understandable.",
  },
];

export const providerBenefits: IconCardItem[] = [
  {
    icon: "building-2",
    eyebrow: "Visibility",
    title: "Show your brand, team, and services clearly",
    description:
      "Create a brand, join an existing one, or publish directly under your own name while keeping your service presentation organized.",
  },
  {
    icon: "clipboard-list",
    eyebrow: "Operations",
    title: "Manage reservation demand without heavy software",
    description:
      "Reziphay keeps approvals, changes, and no-show logic visible without trying to replace how you already run the service.",
  },
  {
    icon: "users",
    eyebrow: "Scale",
    title: "Support solo providers and multi-provider brands",
    description:
      "Use one surface for independent professionals, team-based businesses, and future brand growth campaigns.",
  },
  {
    icon: "layers-3",
    eyebrow: "Flexibility",
    title: "Keep your workflow yours",
    description:
      "Service mode, approval behavior, cancellation rules, and waiting tolerances stay aligned with the provider's own operating style.",
  },
];

export const reservationPhilosophy: IconCardItem[] = [
  {
    icon: "shield",
    title: "Not a payment platform",
    description:
      "Reziphay does not collect service payments, deposits, or refunds. It focuses on discovery, requests, and reservation management.",
  },
  {
    icon: "clock-3",
    title: "Manual approval can stay manual",
    description:
      "If a provider wants approval-based reservations, the system respects that and uses a time-bound response window instead of auto-confirming everything.",
  },
  {
    icon: "badge-check",
    title: "Reviews follow completed service",
    description:
      "The review layer is tied to completed reservations, which supports better trust signals for both customers and providers.",
  },
];

export const featuredCategories: CategoryPageContent[] = [
  {
    slug: "barbershops",
    name: "Barbershops",
    title: "Make barbershops easier to discover and book around real demand.",
    description:
      "Help clients compare barbers, browse services, and send reservation requests without forcing your team into a rigid slot system.",
    intro:
      "Barbershops need visibility, repeat visits, and a reservation flow that supports both walk-in culture and planned appointments.",
    benefits: [
      "Show haircut, beard, grooming, and styling services with provider-specific detail.",
      "Keep manual approval available for busy hours and peak demand windows.",
      "Surface ratings and provider profiles to build confidence before the request is sent.",
    ],
    keywords: ["barber booking app", "barbershop reservations", "grooming discovery"],
  },
  {
    slug: "dental-clinics",
    name: "Dental clinics",
    title: "Present dental services with more trust and clearer booking intent.",
    description:
      "Reziphay helps dental clinics explain services, spotlight specialists, and centralize incoming reservation requests through a mobile-first experience.",
    intro:
      "Dental discovery is trust-heavy. Patients need service clarity, provider credibility, and an easy path to request a visit.",
    benefits: [
      "Organize treatments, consultations, and specialist profiles under a single clinic brand.",
      "Use review visibility and completed-service feedback to support patient confidence.",
      "Allow provider-managed scheduling instead of overpromising locked slots online.",
    ],
    keywords: ["dentist reservation app", "dental clinic discovery", "book dentist mobile"],
  },
  {
    slug: "beauty-studios",
    name: "Beauty studios",
    title: "Give beauty studios a premium discovery surface without heavyweight booking software.",
    description:
      "Create a polished storefront for makeup, skin, lash, nail, and hair services while keeping reservations flexible for the team.",
    intro:
      "Beauty businesses live on presentation and trust. Reziphay combines brand visibility, service discovery, and request-based reservation flow.",
    benefits: [
      "Highlight services, visuals, providers, and brand identity in one mobile-friendly profile.",
      "Support solo specialists or team-based studios from the same foundation.",
      "Keep provider approval and change-request logic aligned with busy calendars.",
    ],
    keywords: ["beauty studio booking", "salon reservation platform", "beauty service app"],
  },
  {
    slug: "wellness-services",
    name: "Wellness services",
    title: "Support wellness businesses that need flexibility, trust, and repeat discovery.",
    description:
      "From massage and therapy to coaching and consultations, Reziphay helps people find the right provider and request a session simply.",
    intro:
      "Wellness categories often depend on provider fit, review credibility, and local discovery more than instant checkout.",
    benefits: [
      "Support provider profiles that explain expertise, service format, and location context clearly.",
      "Let customers compare services and send requests without payment friction on the web.",
      "Use category and city landing pages as an SEO growth layer for local demand capture.",
    ],
    keywords: ["wellness booking app", "massage reservation platform", "coaching reservation app"],
  },
];

export const featuredCities: CityPageContent[] = [
  {
    slug: "baku",
    name: "Baku",
    title: "Build local service discovery around Baku with a mobile-first reservation layer.",
    description:
      "Use Reziphay's city page foundation to attract search demand, explain service categories, and route interested users into the mobile app.",
    intro:
      "Baku is a strong example of the city-based SEO model: category discovery, trust content, and provider acquisition can all start from one local landing surface.",
    signals: [
      "Explain which service categories are a fit for the city page.",
      "Capture provider interest from local businesses that want more visibility.",
      "Route service seekers into the app for discovery and reservation requests.",
    ],
    keywords: ["baku services app", "baku reservation platform", "local service discovery baku"],
  },
  {
    slug: "istanbul",
    name: "Istanbul",
    title: "Create a scalable city landing model for Istanbul and similar large markets.",
    description:
      "City pages help Reziphay collect search traffic and communicate value to both customers and providers in busy urban service markets.",
    intro:
      "Large, category-dense cities need structured discovery. Istanbul pages can combine category storytelling, provider demand capture, and localized trust content.",
    signals: [
      "Group category entry points for beauty, health, wellness, and consulting.",
      "Show provider benefits for multi-provider brands and independent professionals.",
      "Use FAQ and resource content to answer local-intent search questions.",
    ],
    keywords: ["istanbul booking app", "istanbul service discovery", "istanbul provider platform"],
  },
  {
    slug: "dubai",
    name: "Dubai",
    title: "Use Dubai landing pages to support premium service discovery and provider growth.",
    description:
      "Dubai is a fit for Reziphay's premium-but-clear positioning: a polished website layer and mobile-first discovery experience for high-intent service demand.",
    intro:
      "Premium local markets need clarity more than clutter. A city landing page can speak to service seekers, teams, and brand owners at the same time.",
    signals: [
      "Use category pages for vertical depth and city pages for local demand capture.",
      "Create provider-led lead capture without pretending to be a full web booking engine.",
      "Keep the website growth-focused while the app handles the operational flow.",
    ],
    keywords: ["dubai reservation app", "dubai service providers app", "dubai wellness booking"],
  },
];

export const customerJourney: TimelineStep[] = [
  {
    title: "Explore providers, services, categories, and nearby options",
    description:
      "The mobile app helps customers search known services, compare provider quality signals, and browse category or location-driven discovery lists.",
  },
  {
    title: "Review service details before requesting time",
    description:
      "Customers can inspect provider identity, brand context, pricing when available, location, reviews, and suggested times before sending a reservation request.",
  },
  {
    title: "Track approval, changes, and completion status",
    description:
      "Reservation status, change requests, and completion signals stay transparent without turning the experience into a complex booking dashboard.",
  },
];

export const providerJourney: TimelineStep[] = [
  {
    title: "Create a brand or publish under your own name",
    description:
      "Providers can establish a brand, join an existing one, or operate independently depending on how the business is structured.",
  },
  {
    title: "Define services, working logic, and reservation rules",
    description:
      "Service mode, cancellation tolerance, approval style, and waiting rules remain configurable so the product supports real-world operations.",
  },
  {
    title: "Handle requests, approvals, changes, and completions",
    description:
      "Providers stay in control of demand while the system keeps status, visibility, and customer communication easier to manage.",
  },
];

export const featureGroups: FeatureGroup[] = [
  {
    title: "Discovery surfaces",
    description:
      "Website and app layers work together to help people find services faster and compare the right providers.",
    items: [
      {
        icon: "search",
        title: "Service and provider discovery",
        description:
          "Expose services, provider profiles, brands, and categories through a clear search-led entry point.",
      },
      {
        icon: "map-pin",
        title: "Location-aware exploration",
        description:
          "Promote nearby services and city/category landing surfaces that match high-intent local demand.",
      },
      {
        icon: "star",
        title: "Review-backed trust",
        description:
          "Use ratings and comments tied to completed reservations instead of unverified public testimonials.",
      },
    ],
  },
  {
    title: "Reservation request flow",
    description:
      "Reziphay keeps the process lightweight by centering suggested times and provider-controlled approvals.",
    items: [
      {
        icon: "calendar-clock",
        title: "Suggested time windows",
        description:
          "Availability is presented as provider guidance, not as guaranteed slot inventory locked by the website.",
      },
      {
        icon: "bell-dot",
        title: "Status and notifications",
        description:
          "Push and in-app notifications keep both sides informed about approvals, changes, cancellations, and upcoming reservations.",
      },
      {
        icon: "route",
        title: "Change and cancellation flows",
        description:
          "Both sides can request changes or cancel with reasons while staying aligned to service-specific rules.",
      },
    ],
  },
  {
    title: "Provider operations",
    description:
      "The platform supports independent professionals, teams, and brands without turning every workflow into the same template.",
    items: [
      {
        icon: "building-2",
        title: "Brand and team support",
        description:
          "Organize services under a brand, add members, and create a cleaner presence for multi-provider businesses.",
      },
      {
        icon: "layers-3",
        title: "Flexible service modes",
        description:
          "Solo and multi-service logic can coexist so providers do not lose the way they already work.",
      },
      {
        icon: "scan-line",
        title: "Completion verification options",
        description:
          "Reservation completion can happen via QR or manual confirmation depending on how the provider wants to operate.",
      },
    ],
  },
];

export const faqItems: FaqItem[] = [
  {
    question: "What is Reziphay?",
    answer:
      "Reziphay is a mobile-first reservation platform that helps people discover services, compare providers, and request reservations while giving providers a flexible way to manage incoming demand.",
  },
  {
    question: "Does Reziphay take payments or deposits?",
    answer:
      "No. Reziphay is not a payment platform and does not position itself as a deposit, refund, or checkout system.",
  },
  {
    question: "Can people complete a full booking from the website?",
    answer:
      "No. The website is the marketing and growth layer. Discovery and reservation requests are centered in the mobile app.",
  },
  {
    question: "Are reservation times hard-locked like a traditional slot engine?",
    answer:
      "No. Time suggestions and availability windows are presented as provider-led guidance. Providers can keep manual approval logic and flexible workflows.",
  },
  {
    question: "When can customers leave reviews?",
    answer:
      "Reviews and ratings are intended to follow completed reservations, which supports more credible feedback signals.",
  },
  {
    question: "Which industries can use Reziphay?",
    answer:
      "The product is category-agnostic. It can support barbers, dentists, beauty professionals, wellness services, consultants, local service businesses, and more.",
  },
  {
    question: "What does the brand structure mean?",
    answer:
      "Brands help providers organize visibility, locations, and team members under one recognizable identity while still supporting individual service owners.",
  },
  {
    question: "How do providers join?",
    answer:
      "Providers can register through the mobile product and can also leave interest details through the website so the team can follow up on launch or partnership demand.",
  },
];

export const aboutPrinciples: IconCardItem[] = [
  {
    icon: "sparkles",
    title: "Clear product boundaries",
    description:
      "The website explains, converts, and captures demand. The mobile app owns the reservation experience.",
  },
  {
    icon: "shield",
    title: "Trust through real interactions",
    description:
      "Ratings, reviews, and provider reputation are tied to behavior in the platform rather than generic promotional claims.",
  },
  {
    icon: "arrow-up-right",
    title: "Growth without product distortion",
    description:
      "SEO, provider acquisition, and local landing pages should grow demand without misrepresenting how reservations work.",
  },
];

export const privacySections: LegalSection[] = [
  {
    title: "Scope",
    paragraphs: [
      "This privacy summary covers the public Reziphay website and the contact and provider-interest forms presented on it.",
      "Operational reservation data belongs to the mobile product and backend services, which can introduce additional privacy disclosures as those flows are finalized.",
    ],
  },
  {
    title: "What the website may collect",
    paragraphs: [
      "The website may collect contact details, provider interest details, device and browser diagnostics, and event tracking data needed to understand conversion behavior.",
    ],
    bullets: [
      "Name and email submitted through forms",
      "Optional company, city, category, or phone information",
      "Basic page-view and CTA interaction analytics",
    ],
  },
  {
    title: "How information is used",
    paragraphs: [
      "Submitted information is used to respond to inquiries, manage launch interest, improve the site experience, and understand demand across customer and provider journeys.",
    ],
  },
  {
    title: "Retention and security",
    paragraphs: [
      "Website form submissions should be retained only as long as needed for follow-up and operational analysis, then removed or archived according to internal policy.",
      "Security controls should reflect the sensitivity of submitted contact data and any integrations added later.",
    ],
  },
];

export const termsSections: LegalSection[] = [
  {
    title: "Website purpose",
    paragraphs: [
      "Reziphay.com is a marketing, information, SEO, and lead-capture surface for the Reziphay mobile product.",
      "The website does not promise or provide a full web-based reservation engine, payment processing, or deposit handling.",
    ],
  },
  {
    title: "Availability and content",
    paragraphs: [
      "Feature descriptions, city pages, category pages, and launch materials may evolve as the mobile product, provider network, and legal readiness expand.",
      "Nothing on the website should be treated as a guarantee of provider availability, booking confirmation, or supported payment flow.",
    ],
  },
  {
    title: "Provider and customer responsibilities",
    paragraphs: [
      "Providers and customers remain responsible for the service relationship, communications, and any arrangements beyond the reservation request infrastructure.",
    ],
  },
  {
    title: "Future integrations",
    paragraphs: [
      "Internal admin routes and backend integrations may be added later without changing the public role of the website.",
    ],
  },
];

export const blogPosts: BlogPost[] = [
  {
    slug: "why-flexible-booking-matters",
    title: "Why flexible reservation logic matters for service businesses",
    description:
      "Rigid slot engines often break down in real service environments. This guide explains why a request-based model can be a better fit.",
    category: "Operations",
    publishedAt: "2026-03-12",
    readTime: "5 min read",
    sections: [
      {
        title: "Rigid booking tools are not always honest about availability",
        paragraphs: [
          "Many service businesses do not run on perfectly locked calendars. Team changes, walk-ins, manual approvals, and service complexity all affect real availability.",
          "A request-based model keeps the experience honest. It can suggest likely times without pretending every slot is guaranteed inventory.",
        ],
      },
      {
        title: "Flexibility helps both providers and customers",
        paragraphs: [
          "Customers still want speed, clarity, and trust. Providers want control over how reservations are approved and completed.",
          "The best product balance is to simplify the request flow while respecting how the service actually operates.",
        ],
        bullets: [
          "Suggested times instead of overpromised locks",
          "Provider-managed approval windows",
          "Clear status updates after the request is sent",
        ],
      },
    ],
  },
  {
    slug: "how-to-build-trust-in-local-service-marketplaces",
    title: "How to build trust in local service marketplaces",
    description:
      "Service discovery products win when trust signals are clear, relevant, and grounded in actual customer experience.",
    category: "Marketplace",
    publishedAt: "2026-03-12",
    readTime: "6 min read",
    sections: [
      {
        title: "Trust starts with profile clarity",
        paragraphs: [
          "People need to understand what the service is, who provides it, where it happens, and why it may be a fit.",
          "That means well-structured services, provider identity, brand context, and useful discovery filters.",
        ],
      },
      {
        title: "Reviews should be connected to actual service completion",
        paragraphs: [
          "Open-ended public comments can be noisy. A better model ties reviews to completed reservations so social proof reflects real interactions.",
        ],
        bullets: [
          "Completed-service review eligibility",
          "Provider, service, and brand feedback surfaces",
          "Clear moderation and abuse prevention rules",
        ],
      },
    ],
  },
  {
    slug: "seo-foundations-for-service-discovery-platforms",
    title: "SEO foundations for service discovery platforms",
    description:
      "Category pages, city pages, FAQ surfaces, and resource content can all support demand generation for service discovery products.",
    category: "Growth",
    publishedAt: "2026-03-12",
    readTime: "7 min read",
    sections: [
      {
        title: "Use city and category pages as demand capture layers",
        paragraphs: [
          "High-intent searches often combine a category and place. A strong information architecture should support both dimensions from day one.",
          "Even before large-scale content expansion, route foundations for categories and cities keep the system ready for growth.",
        ],
      },
      {
        title: "Do not let SEO distort the product promise",
        paragraphs: [
          "Traffic is useful only if the page tells the truth. If reservations live in the app and payments are out of scope, the content has to state that clearly.",
        ],
        bullets: [
          "Keep headlines honest about what the website does",
          "Use FAQ to answer product-boundary questions",
          "Send high-intent visitors toward the right next step",
        ],
      },
    ],
  },
];

export function getCategoryBySlug(slug: string) {
  return featuredCategories.find((category) => category.slug === slug);
}

export function getCityBySlug(slug: string) {
  return featuredCities.find((city) => city.slug === slug);
}

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

