export const featuredCategories = [
  "Barbers",
  "Dentists",
  "Beauty experts",
  "Maintenance",
  "Wellness",
  "Consultations",
];

export const trustHighlights = [
  {
    title: "Flexible by design",
    description:
      "Providers keep control over how they accept and manage reservations.",
  },
  {
    title: "Built for trust",
    description:
      "Reviews, response behavior, and moderation shape quality over time.",
  },
  {
    title: "Mobile-first utility",
    description:
      "The app is where reservations happen. The website explains and supports growth.",
  },
];

export const howItWorks = [
  {
    title: "Customers discover",
    description:
      "Search services, compare providers, and request the slot that fits.",
  },
  {
    title: "Providers decide",
    description:
      "Manual approval, flexible schedules, and brand structures stay intact.",
  },
  {
    title: "Operations stay clean",
    description:
      "Moderation, visibility labels, and reporting live in a hidden admin surface.",
  },
];

export const businessFeatures = [
  {
    title: "Keep your own rhythm",
    description:
      "Weekly availability, breaks, custom lead times, and no rigid slot engine.",
  },
  {
    title: "Get discovered",
    description:
      "Show up through categories, proximity, ratings, and sponsored visibility.",
  },
  {
    title: "Protect quality",
    description:
      "Reports, review replies, and account actions support a credible network.",
  },
];

export const providerOnboardingSteps = [
  {
    title: "Set up your provider profile",
    description:
      "Create or join a brand, define the service shape, and keep the workflow aligned with how you already operate.",
  },
  {
    title: "Publish services with flexibility",
    description:
      "Add availability rules, cancellation windows, waiting time, and optional visibility support without rigid slot forcing.",
  },
  {
    title: "Receive cleaner reservation requests",
    description:
      "Let discovery, trust signals, and moderation support drive better inbound demand from the app.",
  },
];

export const faqGroups = [
  {
    title: "Product",
    items: [
      {
        question: "What is Reziphay?",
        answer:
          "A flexible reservation platform that connects customers and service providers without forcing a rigid calendar or payment flow.",
      },
      {
        question: "Does Reziphay handle payments?",
        answer:
          "No. Reziphay is an intermediary system for discovery, requests, coordination, and trust.",
      },
      {
        question: "Who is it for?",
        answer:
          "Any service business that needs reservations, from barbers and dentists to consultants and maintenance teams.",
      },
    ],
  },
  {
    title: "Providers",
    items: [
      {
        question: "Do providers control their own schedule?",
        answer:
          "Yes. Providers define availability and decide how to work with incoming requests instead of handing control to an inflexible slot engine.",
      },
      {
        question: "What is sponsored visibility?",
        answer:
          "Optional paid placement for services or brands in key discovery surfaces. It is not a payment or checkout flow.",
      },
    ],
  },
  {
    title: "Trust",
    items: [
      {
        question: "How do reviews work?",
        answer:
          "Only completed reservations can be reviewed. Ratings can exist at service, provider, and brand level.",
      },
      {
        question: "How does moderation work?",
        answer:
          "Customers and providers can report abuse or fake entities, while the hidden admin panel handles moderation, labels, and account actions.",
      },
    ],
  },
];

export const legalDocuments = {
  terms: {
    title: "Terms of Use",
    updatedAt: "March 13, 2026",
    sections: [
      {
        heading: "Role of the platform",
        body: "Reziphay mediates reservations between customers and service providers. It does not process payments and does not replace the provider’s own business judgment.",
      },
      {
        heading: "Account responsibilities",
        body: "Users must provide accurate identity and contact details, protect their session, and avoid abusive, fraudulent, or misleading activity.",
      },
      {
        heading: "Moderation and enforcement",
        body: "Accounts or listings that appear fake, abusive, or harmful may be restricted, suspended, or kept publicly visible with reservation access disabled.",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    updatedAt: "March 13, 2026",
    sections: [
      {
        heading: "Data collected",
        body: "We collect the identity, contact, reservation, and moderation data needed to operate the platform and protect trust.",
      },
      {
        heading: "How data is used",
        body: "Data supports authentication, reservation coordination, review eligibility, moderation, and operational analytics.",
      },
      {
        heading: "Contact",
        body: "Questions about privacy can be sent through the support form or to the published contact email.",
      },
    ],
  },
  cookies: {
    title: "Cookie Policy",
    updatedAt: "March 13, 2026",
    sections: [
      {
        heading: "Essential cookies",
        body: "The website uses essential cookies for admin authentication and secure operational sessions.",
      },
      {
        heading: "Preference handling",
        body: "Future preference or analytics cookies will be disclosed clearly and kept separate from essential auth cookies.",
      },
    ],
  },
} as const;

export const seoPages = {
  barber: {
    title: "Barber reservation app",
    intro:
      "A calm, flexible reservation flow for barbers who need visibility and clients who need trust.",
  },
  dentist: {
    title: "Dentist reservation platform",
    intro:
      "A clean way to coordinate discovery and reservation requests for dental practices.",
  },
  beauty: {
    title: "Beauty booking tool",
    intro:
      "Flexible request management and clearer visibility for beauty services and brands.",
  },
} as const;
