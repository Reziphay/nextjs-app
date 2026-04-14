import Link from "next/link";
import type { Messages } from "@/i18n/config";
import { AuthHeader } from "@/components/organisms";
import styles from "./home-page.module.css";

type HomePageProps = {
  apiBaseUrl: string;
  messages: Messages;
};

const features = [
  {
    title: "Multi-language support",
    desc: "Browse and book in Azerbaijani, English, or Russian — switch at any time.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    title: "Role-based access",
    desc: "Separate flows for Service Owners and Customers — each gets exactly what they need.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "Brand management",
    desc: "Create, edit, and showcase your brand with logo, gallery, and category tags.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
  {
    title: "Branch locations",
    desc: "Add multiple branches per brand with addresses, hours, breaks, and contact info.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    title: "Reservation system",
    desc: "Customers can browse, book, and manage appointments end-to-end without friction.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    title: "Secure authentication",
    desc: "JWT-based sessions, email verification, and a clean login and register experience.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
];

const steps = [
  {
    n: "1",
    title: "Create your free account",
    desc: "Sign up as a Customer or a Service Owner in under a minute. No credit card required.",
  },
  {
    n: "2",
    title: "Discover services near you",
    desc: "Browse brands by category, view branches, gallery, ratings, and availability.",
  },
  {
    n: "3",
    title: "Book and manage appointments",
    desc: "Confirm your reservation and track it from your personal dashboard.",
  },
];

const ownerBenefits = [
  "Create and publish your brand in minutes",
  "Add unlimited branches with custom hours",
  "Receive and manage customer reservations",
  "Upload a gallery to showcase your work",
  "Categorise your brand for better discovery",
  "Transfer or collaborate on brand ownership",
];

const customerBenefits = [
  "Browse hundreds of service brands",
  "Filter by category, location, and rating",
  "Book appointments with a few taps",
  "Save favourites for quick re-booking",
  "Switch language at any time",
  "Manage all your reservations in one place",
];

const pricingPlans = [
  {
    plan: "Customer",
    title: "Free",
    desc: "For individuals who want to discover and book services effortlessly.",
    amount: "0",
    currency: "",
    per: "forever",
    featured: false,
    featuredLabel: "",
    features: [
      "Personal customer account",
      "Browse all brands & branches",
      "Unlimited reservations",
      "Favourites & history",
      "3-language interface",
      "Email support",
    ],
    cta: "Get started free",
    href: "/auth/register",
  },
  {
    plan: "Service Owner",
    title: "Pro",
    desc: "For businesses that want to grow their brand and manage bookings seamlessly.",
    amount: "29",
    currency: "$",
    per: "/ month",
    featured: true,
    featuredLabel: "Most popular",
    features: [
      "Everything in Free",
      "Create & manage brands",
      "Unlimited branches",
      "Accept & manage reservations",
      "Photo gallery uploads",
      "Brand transfer & moderation tools",
    ],
    cta: "Start free trial",
    href: "/auth/register",
  },
  {
    plan: "Enterprise",
    title: "Custom",
    desc: "For large organisations that need priority support and advanced tooling.",
    amount: "—",
    currency: "",
    per: "talk to us",
    featured: false,
    featuredLabel: "",
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "Priority support SLA",
      "Advanced analytics",
      "Custom integrations",
      "Onboarding assistance",
    ],
    cta: "Contact sales",
    href: "/contact",
  },
];

const faqs = [
  {
    q: "What is Reziphay?",
    a: "Reziphay is a reservation platform that connects customers with service providers. Customers can browse brands, view branch locations, and book appointments. Service owners can manage their brands, branches, and incoming reservations — all from one dashboard.",
  },
  {
    q: "Is Reziphay free to use for customers?",
    a: "Yes — creating a customer account and booking appointments on Reziphay is completely free. There are no hidden fees or credit card requirements for customers.",
  },
  {
    q: "What languages does Reziphay support?",
    a: "Reziphay currently supports Azerbaijani (default), English, and Russian. You can switch languages at any time using the language switcher in the navigation bar.",
  },
  {
    q: "How do I register as a Service Owner?",
    a: "Click 'Sign up' and select 'Service Owner' as your account type during registration. Once your account is active you can create brands, add branches, and start receiving reservations.",
  },
  {
    q: "Can I have more than one brand?",
    a: "Yes. Service Owner accounts can create and manage multiple brands. Each brand can have its own logo, gallery, category tags, and an unlimited number of branch locations.",
  },
  {
    q: "Can I transfer a brand to another user?",
    a: "Yes. Reziphay has a built-in brand transfer system. You can initiate a transfer to any other Service Owner. The recipient must accept before ownership changes hands.",
  },
  {
    q: "How do I cancel or reschedule a reservation?",
    a: "You can view, manage, and cancel upcoming reservations from your personal dashboard under the Reservations section.",
  },
  {
    q: "How do I get help if something goes wrong?",
    a: "You can reach us through the Contact page. Pro and Enterprise accounts receive prioritised response times.",
  },
];

const CheckIcon = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="1 4 3 6 7 2" />
  </svg>
);

export function HomePage({ messages }: HomePageProps) {
  return (
    <div className={styles.page}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className={styles.topbar}>
        <AuthHeader />
      </div>

      <main className={styles.main}>
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className={styles.hero}>
          <div className={styles.heroBg} aria-hidden="true" />
          <div className={styles.heroDots} aria-hidden="true" />

          <div className={`${styles.container} ${styles.heroInner}`}>
            <span className={styles.eyebrow}>
              The reservation platform for everyone
            </span>

            <h1 className={styles.heroTitle}>
              Book services.<br />
              Manage brands.<br />
              <em>All in one place.</em>
            </h1>

            <p className={styles.heroLead}>
              Reziphay connects customers with service providers. Discover, book, and manage appointments effortlessly — in Azerbaijani, English, and Russian.
            </p>

            <div className={styles.heroCtas}>
              <Link href="/auth/register" className={styles.ctaPrimary}>
                Get started free
              </Link>
              <Link href="/auth/login" className={styles.ctaSecondary}>
                Sign in →
              </Link>
            </div>

            <div className={styles.heroBadges}>
              <span className={styles.heroBadge}>
                <span className={styles.heroBadgeDot} aria-hidden="true" />
                No credit card required
              </span>
              <span className={styles.heroBadge}>
                <span className={styles.heroBadgeDot} aria-hidden="true" />
                Free for customers
              </span>
              <span className={styles.heroBadge}>
                <span className={styles.heroBadgeDot} aria-hidden="true" />
                3 languages supported
              </span>
            </div>
          </div>
        </section>

        {/* ── Stats ────────────────────────────────────────────────────── */}
        <section className={styles.stats} aria-label="Platform statistics">
          <div className={styles.container}>
            <div className={styles.statsGrid}>
              {[
                { value: "500+", label: "Brands" },
                { value: "10k+", label: "Bookings made" },
                { value: "3", label: "Languages" },
                { value: "2", label: "User roles" },
              ].map(({ value, label }) => (
                <div key={label} className={styles.statItem}>
                  <span className={styles.statValue}>{value}</span>
                  <span className={styles.statLabel}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────────────── */}
        <section className={styles.features} aria-labelledby="features-title">
          <div className={styles.container}>
            <header className={styles.sectionHeader}>
              <span className={styles.eyebrow}>Features</span>
              <h2 className={styles.sectionTitle} id="features-title">
                Everything you need, nothing you don&apos;t
              </h2>
              <p className={styles.sectionLead}>
                Built around two roles — Customers who book, and Service Owners who manage. Both get a focused, clean experience.
              </p>
            </header>

            <div className={styles.featuresGrid}>
              {features.map((f) => (
                <article key={f.title} className={styles.featureCard}>
                  <div className={styles.featureIcon}>{f.icon}</div>
                  <h3 className={styles.featureTitle}>{f.title}</h3>
                  <p className={styles.featureDesc}>{f.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────── */}
        <section className={styles.howItWorks} aria-labelledby="how-title">
          <div className={styles.container}>
            <header className={styles.sectionHeader}>
              <span className={styles.eyebrow}>How it works</span>
              <h2 className={styles.sectionTitle} id="how-title">
                Up and running in three steps
              </h2>
              <p className={styles.sectionLead}>
                Getting started on Reziphay takes less than two minutes.
              </p>
            </header>

            <div className={styles.stepsGrid}>
              {steps.map((s) => (
                <div key={s.n} className={styles.step}>
                  <div className={styles.stepNumber} aria-hidden="true">{s.n}</div>
                  <div>
                    <h3 className={styles.stepTitle}>{s.title}</h3>
                    <p className={styles.stepDesc}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── For service owners ───────────────────────────────────────── */}
        <section className={styles.split} aria-labelledby="owners-title">
          <div className={styles.container}>
            <div className={styles.splitInner}>
              <div className={styles.splitText}>
                <span className={styles.eyebrow}>For Service Owners</span>
                <h2 className={styles.splitTitle} id="owners-title">
                  Grow your brand and manage bookings in one place
                </h2>
                <p className={styles.splitLead}>
                  Publish your brand, list all your locations, and handle incoming reservations — without juggling multiple apps.
                </p>
                <ul className={styles.splitList} aria-label="Service Owner benefits">
                  {ownerBenefits.map((b) => (
                    <li key={b} className={styles.splitListItem}>
                      <span className={styles.splitListIcon} aria-hidden="true">
                        <CheckIcon />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register" className={styles.ctaPrimary} style={{ alignSelf: "flex-start" }}>
                  Register as Service Owner →
                </Link>
              </div>

              <div className={styles.splitVisual} aria-hidden="true">
                <span className={styles.splitVisualTitle}>Brand overview</span>
                {[
                  { color: "#0286df", badge: "Active" },
                  { color: "#f5b82e", badge: "Active" },
                  { color: "#08a045", badge: "Pending" },
                ].map((item, i) => (
                  <div key={i} className={styles.mockCard}>
                    <div
                      className={styles.mockCardDot}
                      style={{ background: `${item.color}22`, border: `2px solid ${item.color}` }}
                    />
                    <div className={styles.mockCardLines}>
                      <div className={styles.mockCardLine} style={{ width: "60%" }} />
                      <div className={styles.mockCardLine} style={{ width: "40%" }} />
                    </div>
                    <span
                      className={styles.mockCardBadge}
                      style={
                        item.badge === "Active"
                          ? { background: "var(--app-success-bg)", color: "var(--app-success)" }
                          : { background: "var(--app-warning-bg)", color: "var(--app-warning-strong)" }
                      }
                    >
                      {item.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── For customers ────────────────────────────────────────────── */}
        <section className={`${styles.split} ${styles.splitAlt}`} aria-labelledby="customers-title">
          <div className={styles.container}>
            <div className={`${styles.splitInner} ${styles.splitInnerReverse}`}>
              <div className={styles.splitText}>
                <span className={styles.eyebrow}>For Customers</span>
                <h2 className={styles.splitTitle} id="customers-title">
                  Discover services and book in seconds
                </h2>
                <p className={styles.splitLead}>
                  Find exactly what you&apos;re looking for — browse brands by category, explore branches, and confirm your booking in just a few taps.
                </p>
                <ul className={styles.splitList} aria-label="Customer benefits">
                  {customerBenefits.map((b) => (
                    <li key={b} className={styles.splitListItem}>
                      <span className={styles.splitListIcon} aria-hidden="true">
                        <CheckIcon />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register" className={styles.ctaSecondary} style={{ alignSelf: "flex-start" }}>
                  Create free account →
                </Link>
              </div>

              <div className={styles.splitVisual} aria-hidden="true">
                <span className={styles.splitVisualTitle}>Upcoming reservations</span>
                {[
                  { color: "#0286df", badge: "Confirmed" },
                  { color: "#f5b82e", badge: "Confirmed" },
                  { color: "#dd2d4a", badge: "Pending" },
                ].map((item, i) => (
                  <div key={i} className={styles.mockCard}>
                    <div
                      className={styles.mockCardDot}
                      style={{ background: `${item.color}22`, border: `2px solid ${item.color}` }}
                    />
                    <div className={styles.mockCardLines}>
                      <div className={styles.mockCardLine} style={{ width: "55%" }} />
                      <div className={styles.mockCardLine} style={{ width: "35%" }} />
                    </div>
                    <span
                      className={styles.mockCardBadge}
                      style={
                        item.badge === "Confirmed"
                          ? { background: "var(--app-success-bg)", color: "var(--app-success)" }
                          : { background: "var(--app-warning-bg)", color: "var(--app-warning-strong)" }
                      }
                    >
                      {item.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Pricing ──────────────────────────────────────────────────── */}
        <section className={styles.pricing} aria-labelledby="pricing-title">
          <div className={styles.container}>
            <header className={styles.sectionHeader}>
              <span className={styles.eyebrow}>Pricing</span>
              <h2 className={styles.sectionTitle} id="pricing-title">
                Simple, transparent pricing
              </h2>
              <p className={styles.sectionLead}>
                Customers always book for free. Service Owners get a 14-day free trial — no credit card needed.
              </p>
            </header>

            <div className={styles.pricingGrid}>
              {pricingPlans.map((p) => (
                <article
                  key={p.plan}
                  className={`${styles.pricingCard} ${p.featured ? styles.pricingCardFeatured : ""}`}
                >
                  {p.featured && (
                    <span className={styles.pricingFeaturedBadge}>{p.featuredLabel}</span>
                  )}
                  <div className={styles.pricingPlan}>{p.plan}</div>
                  <div className={styles.pricingTitle}>{p.title}</div>
                  <p className={styles.pricingDesc}>{p.desc}</p>

                  <div className={styles.pricingPrice}>
                    {p.currency && <span className={styles.pricingCurrency}>{p.currency}</span>}
                    <span className={styles.pricingAmount}>{p.amount}</span>
                    <span className={styles.pricingPer}>{p.per}</span>
                  </div>

                  <div className={styles.pricingDivider} aria-hidden="true" />

                  <ul className={styles.pricingFeatures} aria-label={`${p.plan} plan features`}>
                    {p.features.map((f) => (
                      <li key={f} className={styles.pricingFeature}>
                        <span className={`${styles.pricingCheck} ${p.featured ? styles.pricingCheckFeatured : ""}`} aria-hidden="true">
                          <CheckIcon />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={p.href}
                    className={`${styles.pricingCta} ${p.featured ? styles.pricingCtaFeatured : ""}`}
                  >
                    {p.cta}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section className={styles.faq} aria-labelledby="faq-title">
          <div className={styles.containerNarrow}>
            <header className={styles.sectionHeader}>
              <span className={styles.eyebrow}>FAQ</span>
              <h2 className={styles.sectionTitle} id="faq-title">
                Frequently asked questions
              </h2>
              <p className={styles.sectionLead}>
                Can&apos;t find the answer you&apos;re looking for? Reach out via the{" "}
                <Link href="/contact" style={{ color: "var(--app-primary)" }}>Contact</Link>{" "}
                page.
              </p>
            </header>

            <div className={styles.faqList}>
              {faqs.map((item) => (
                <details key={item.q} className={styles.faqItem}>
                  <summary>{item.q}</summary>
                  <div className={styles.faqAnswer}>{item.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <section className={styles.cta} aria-labelledby="cta-title">
          <div className={styles.ctaBg} aria-hidden="true" />
          <div className={`${styles.containerNarrow} ${styles.ctaInner}`}>
            <span className={`${styles.eyebrow} ${styles.eyebrowDark}`}>
              Get started today
            </span>
            <h2 className={styles.ctaTitle} id="cta-title">
              Ready to join Reziphay?
            </h2>
            <p className={styles.ctaLead}>
              Create your free account in seconds. No credit card required — customers book for free, forever.
            </p>
            <div className={styles.ctaButtons}>
              <Link href="/auth/register" className={styles.ctaButtonPrimary}>
                Create free account
              </Link>
              <Link href="/auth/login" className={styles.ctaButtonSecondary}>
                Sign in →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <footer className={styles.footer}>
          <div className={styles.container}>
            <div className={styles.footerInner}>
              <Link href="/" className={styles.footerBrand} aria-label="Reziphay home">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="3" y="3" width="8" height="8" rx="1.5" />
                  <rect x="13" y="3" width="8" height="8" rx="1.5" opacity="0.6" />
                  <rect x="3" y="13" width="8" height="8" rx="1.5" opacity="0.6" />
                  <rect x="13" y="13" width="8" height="8" rx="1.5" opacity="0.35" />
                </svg>
                Reziphay
              </Link>

              <nav className={styles.footerLinks} aria-label="Footer navigation">
                <Link href="/about" className={styles.footerLink}>{messages.navigation.aboutUs}</Link>
                <Link href="/questions" className={styles.footerLink}>{messages.navigation.questions}</Link>
                <Link href="/contact" className={styles.footerLink}>{messages.navigation.contactUs}</Link>
                <Link href="/auth/login" className={styles.footerLink}>{messages.auth.login.submit}</Link>
                <Link href="/auth/register" className={styles.footerLink}>{messages.auth.login.signUp}</Link>
              </nav>

              <p className={styles.footerCopy}>
                © {new Date().getFullYear()} Reziphay. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
