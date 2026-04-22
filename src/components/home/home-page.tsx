import Link from "next/link";
import type { Messages } from "@/i18n/config";
import { AuthHeader } from "@/components/organisms";
import styles from "./home-page.module.css";

type HomePageProps = {
  apiBaseUrl: string;
  messages: Messages;
};

const featureIcons = [
  (
    <svg key="brand" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
  (
    <svg key="branch" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  (
    <svg key="reservations" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  (
    <svg key="multilingual" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  (
    <svg key="roles" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  (
    <svg key="insights" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 3v18h18" />
      <path d="M7 14l3-3 3 2 4-5" />
      <circle cx="7" cy="14" r="1" />
      <circle cx="10" cy="11" r="1" />
      <circle cx="13" cy="13" r="1" />
      <circle cx="17" cy="8" r="1" />
    </svg>
  ),
];

const CheckIcon = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="1 4 3 6 7 2" />
  </svg>
);

export function HomePage({ apiBaseUrl, messages }: HomePageProps) {
  void apiBaseUrl;

  const landing = messages.landing;

  const heroBadges = [
    `${landing.stats.freeNumber} ${landing.stats.freeLabel}`,
    `${landing.stats.languagesNumber} ${landing.stats.languagesLabel}`,
    `${landing.stats.accountTypesNumber} ${landing.stats.accountTypesLabel}`,
  ];

  const stats = [
    {
      value: landing.stats.languagesNumber,
      label: landing.stats.languagesLabel,
    },
    {
      value: landing.stats.accountTypesNumber,
      label: landing.stats.accountTypesLabel,
    },
    {
      value: landing.stats.availabilityNumber,
      label: landing.stats.availabilityLabel,
    },
    {
      value: landing.stats.freeNumber,
      label: landing.stats.freeLabel,
    },
  ];

  const features = [
    {
      title: landing.features.brandTitle,
      desc: landing.features.brandDesc,
      icon: featureIcons[0],
    },
    {
      title: landing.features.branchTitle,
      desc: landing.features.branchDesc,
      icon: featureIcons[1],
    },
    {
      title: landing.features.reservationsTitle,
      desc: landing.features.reservationsDesc,
      icon: featureIcons[2],
    },
    {
      title: landing.features.multilingualTitle,
      desc: landing.features.multilingualDesc,
      icon: featureIcons[3],
    },
    {
      title: landing.features.rolesTitle,
      desc: landing.features.rolesDesc,
      icon: featureIcons[4],
    },
    {
      title: landing.features.insightsTitle,
      desc: landing.features.insightsDesc,
      icon: featureIcons[5],
    },
  ];

  const steps = [
    {
      n: "1",
      title: landing.howItWorks.step1Title,
      desc: landing.howItWorks.step1Desc,
    },
    {
      n: "2",
      title: landing.howItWorks.step2Title,
      desc: landing.howItWorks.step2Desc,
    },
    {
      n: "3",
      title: landing.howItWorks.step3Title,
      desc: landing.howItWorks.step3Desc,
    },
  ];

  const ownerBenefits = [
    landing.dualValue.ownerF1,
    landing.dualValue.ownerF2,
    landing.dualValue.ownerF3,
    landing.dualValue.ownerF4,
    landing.dualValue.ownerF5,
    landing.dualValue.ownerF6,
  ];

  const customerBenefits = [
    landing.dualValue.customerF1,
    landing.dualValue.customerF2,
    landing.dualValue.customerF3,
    landing.dualValue.customerF4,
    landing.dualValue.customerF5,
    landing.dualValue.customerF6,
  ];

  const pricingPlans = [
    {
      plan: landing.pricing.starterName,
      title: landing.pricing.starterPrice,
      desc: landing.pricing.starterDesc,
      amount: "",
      currency: "",
      per: "",
      featured: false,
      featuredLabel: "",
      features: [
        landing.pricing.starterF1,
        landing.pricing.starterF2,
        landing.pricing.starterF3,
        landing.pricing.starterF4,
        landing.pricing.starterF5,
      ],
      cta: landing.pricing.starterCta,
      href: "/auth/register",
    },
    {
      plan: landing.pricing.proName,
      title: landing.pricing.proPrice,
      desc: landing.pricing.proDesc,
      amount: landing.pricing.proPrice,
      currency: "",
      per: landing.pricing.proPeriod,
      featured: true,
      featuredLabel: landing.pricing.mostPopular,
      features: [
        landing.pricing.proF1,
        landing.pricing.proF2,
        landing.pricing.proF3,
        landing.pricing.proF4,
        landing.pricing.proF5,
        landing.pricing.proF6,
      ],
      cta: landing.pricing.proCta,
      href: "/auth/register",
    },
    {
      plan: landing.pricing.enterpriseName,
      title: landing.pricing.enterprisePrice,
      desc: landing.pricing.enterpriseDesc,
      amount: "",
      currency: "",
      per: "",
      featured: false,
      featuredLabel: "",
      features: [
        landing.pricing.enterpriseF1,
        landing.pricing.enterpriseF2,
        landing.pricing.enterpriseF3,
        landing.pricing.enterpriseF4,
        landing.pricing.enterpriseF5,
        landing.pricing.enterpriseF6,
      ],
      cta: landing.pricing.enterpriseCta,
      href: "/contact",
    },
  ];

  const faqs = [
    { q: landing.faq.q1, a: landing.faq.a1 },
    { q: landing.faq.q2, a: landing.faq.a2 },
    { q: landing.faq.q3, a: landing.faq.a3 },
    { q: landing.faq.q4, a: landing.faq.a4 },
    { q: landing.faq.q5, a: landing.faq.a5 },
    { q: landing.faq.q6, a: landing.faq.a6 },
  ];

  const ownerCards = [
    { color: "#0286df", badge: messages.brands.statusActive },
    { color: "#f5b82e", badge: messages.brands.statusActive },
    { color: "#08a045", badge: messages.brands.statusPending },
  ];

  const customerCards = [
    { color: "#0286df", badge: messages.brands.statusActive },
    { color: "#f5b82e", badge: messages.brands.statusActive },
    { color: "#dd2d4a", badge: messages.brands.statusPending },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <AuthHeader />
      </div>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroBg} aria-hidden="true" />
          <div className={styles.heroDots} aria-hidden="true" />

          <div className={`${styles.container} ${styles.heroInner}`}>
            <span className={styles.eyebrow}>{landing.hero.eyebrow}</span>

            <h1 className={styles.heroTitle}>
              {landing.hero.title}
              <br />
              <em>{landing.hero.titleAccent}</em>
            </h1>

            <p className={styles.heroLead}>{landing.hero.description}</p>

            <div className={styles.heroCtas}>
              <Link href="/auth/register" className={styles.ctaPrimary}>
                {landing.hero.ctaPrimary}
              </Link>
              <Link href="/auth/login" className={styles.ctaSecondary}>
                {landing.hero.ctaSecondary} →
              </Link>
            </div>

            <div className={styles.heroBadges}>
              {heroBadges.map((badge) => (
                <span key={badge} className={styles.heroBadge}>
                  <span className={styles.heroBadgeDot} aria-hidden="true" />
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.stats}>
          <div className={styles.container}>
            <div className={styles.statsGrid}>
              {stats.map(({ value, label }) => (
                <div key={label} className={styles.statItem}>
                  <span className={styles.statValue}>{value}</span>
                  <span className={styles.statLabel}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.features} aria-labelledby="features-title">
          <div className={styles.container}>
            <header className={styles.sectionHeader}>
              <span className={styles.eyebrow}>{landing.features.sectionLabel}</span>
              <h2 className={styles.sectionTitle} id="features-title">
                {landing.features.sectionTitle}
              </h2>
              <p className={styles.sectionLead}>{landing.features.sectionLead}</p>
            </header>

            <div className={styles.featuresGrid}>
              {features.map((feature) => (
                <article key={feature.title} className={styles.featureCard}>
                  <div className={styles.featureIcon}>{feature.icon}</div>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDesc}>{feature.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.howItWorks} aria-labelledby="how-title">
          <div className={styles.container}>
            <header className={styles.sectionHeader}>
              <span className={styles.eyebrow}>{landing.howItWorks.sectionLabel}</span>
              <h2 className={styles.sectionTitle} id="how-title">
                {landing.howItWorks.sectionTitle}
              </h2>
              <p className={styles.sectionLead}>{landing.howItWorks.sectionLead}</p>
            </header>

            <div className={styles.stepsGrid}>
              {steps.map((step) => (
                <div key={step.n} className={styles.step}>
                  <div className={styles.stepNumber} aria-hidden="true">
                    {step.n}
                  </div>
                  <div>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    <p className={styles.stepDesc}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.split} aria-labelledby="owners-title">
          <div className={styles.container}>
            <div className={styles.splitInner}>
              <div className={styles.splitText}>
                <span className={styles.eyebrow}>{landing.dualValue.ownerBadge}</span>
                <h2 className={styles.splitTitle} id="owners-title">
                  {landing.dualValue.ownerTitle}
                </h2>
                <p className={styles.splitLead}>{landing.dualValue.ownerDesc}</p>
                <ul className={styles.splitList} aria-label={landing.dualValue.ownerTitle}>
                  {ownerBenefits.map((benefit) => (
                    <li key={benefit} className={styles.splitListItem}>
                      <span className={styles.splitListIcon} aria-hidden="true">
                        <CheckIcon />
                      </span>
                      {benefit}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register" className={styles.ctaPrimary} style={{ alignSelf: "flex-start" }}>
                  {landing.dualValue.ownerCta} →
                </Link>
              </div>

              <div className={styles.splitVisual} aria-hidden="true">
                <span className={styles.splitVisualTitle}>{messages.brands.pageTitle}</span>
                {ownerCards.map((item, index) => (
                  <div key={`${item.badge}-${index}`} className={styles.mockCard}>
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
                        item.badge === messages.brands.statusPending
                          ? { background: "var(--app-warning-bg)", color: "var(--app-warning-strong)" }
                          : { background: "var(--app-success-bg)", color: "var(--app-success)" }
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

        <section className={`${styles.split} ${styles.splitAlt}`} aria-labelledby="customers-title">
          <div className={styles.container}>
            <div className={`${styles.splitInner} ${styles.splitInnerReverse}`}>
              <div className={styles.splitText}>
                <span className={styles.eyebrow}>{landing.dualValue.customerBadge}</span>
                <h2 className={styles.splitTitle} id="customers-title">
                  {landing.dualValue.customerTitle}
                </h2>
                <p className={styles.splitLead}>{landing.dualValue.customerDesc}</p>
                <ul className={styles.splitList} aria-label={landing.dualValue.customerTitle}>
                  {customerBenefits.map((benefit) => (
                    <li key={benefit} className={styles.splitListItem}>
                      <span className={styles.splitListIcon} aria-hidden="true">
                        <CheckIcon />
                      </span>
                      {benefit}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register" className={styles.ctaSecondary} style={{ alignSelf: "flex-start" }}>
                  {landing.dualValue.customerCta} →
                </Link>
              </div>

              <div className={styles.splitVisual} aria-hidden="true">
                <span className={styles.splitVisualTitle}>{messages.dashboard.reservations}</span>
                {customerCards.map((item, index) => (
                  <div key={`${item.badge}-${index}`} className={styles.mockCard}>
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
                        item.badge === messages.brands.statusPending
                          ? { background: "var(--app-warning-bg)", color: "var(--app-warning-strong)" }
                          : { background: "var(--app-success-bg)", color: "var(--app-success)" }
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

        <section className={styles.pricing} aria-labelledby="pricing-title">
          <div className={styles.container}>
            <header className={styles.sectionHeader}>
              <span className={styles.eyebrow}>{landing.pricing.sectionLabel}</span>
              <h2 className={styles.sectionTitle} id="pricing-title">
                {landing.pricing.sectionTitle}
              </h2>
              <p className={styles.sectionLead}>{landing.pricing.sectionLead}</p>
            </header>

            <div className={styles.pricingGrid}>
              {pricingPlans.map((plan) => (
                <article
                  key={plan.plan}
                  className={`${styles.pricingCard} ${plan.featured ? styles.pricingCardFeatured : ""}`}
                >
                  {plan.featured && (
                    <span className={styles.pricingFeaturedBadge}>{plan.featuredLabel}</span>
                  )}
                  <div className={styles.pricingPlan}>{plan.plan}</div>
                  <div className={styles.pricingTitle}>{plan.title}</div>
                  <p className={styles.pricingDesc}>{plan.desc}</p>

                  {(plan.amount || plan.per) && (
                    <div className={styles.pricingPrice}>
                      {plan.currency && <span className={styles.pricingCurrency}>{plan.currency}</span>}
                      {plan.amount && <span className={styles.pricingAmount}>{plan.amount}</span>}
                      {plan.per && <span className={styles.pricingPer}>{plan.per}</span>}
                    </div>
                  )}

                  <div className={styles.pricingDivider} aria-hidden="true" />

                  <ul className={styles.pricingFeatures} aria-label={plan.plan}>
                    {plan.features.map((feature) => (
                      <li key={feature} className={styles.pricingFeature}>
                        <span className={`${styles.pricingCheck} ${plan.featured ? styles.pricingCheckFeatured : ""}`} aria-hidden="true">
                          <CheckIcon />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.href}
                    className={`${styles.pricingCta} ${plan.featured ? styles.pricingCtaFeatured : ""}`}
                  >
                    {plan.cta}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.faq} aria-labelledby="faq-title">
          <div className={styles.containerNarrow}>
            <header className={styles.sectionHeader}>
              <span className={styles.eyebrow}>{landing.faq.sectionLabel}</span>
              <h2 className={styles.sectionTitle} id="faq-title">
                {landing.faq.sectionTitle}
              </h2>
              <p className={styles.sectionLead}>
                {landing.faq.sectionLead}{" "}
                <Link href="/contact" style={{ color: "var(--app-primary)" }}>
                  {landing.faq.contactLink}
                </Link>
                .
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

        <section className={styles.cta} aria-labelledby="cta-title">
          <div className={styles.ctaBg} aria-hidden="true" />
          <div className={`${styles.containerNarrow} ${styles.ctaInner}`}>
            <span className={`${styles.eyebrow} ${styles.eyebrowDark}`}>
              {landing.finalCta.eyebrow}
            </span>
            <h2 className={styles.ctaTitle} id="cta-title">
              {landing.finalCta.title}
            </h2>
            <p className={styles.ctaLead}>{landing.finalCta.description}</p>
            <div className={styles.ctaButtons}>
              <Link href="/auth/register" className={styles.ctaButtonPrimary}>
                {landing.finalCta.ctaPrimary}
              </Link>
              <Link href="/auth/login" className={styles.ctaButtonSecondary}>
                {landing.finalCta.ctaSecondary} →
              </Link>
            </div>
          </div>
        </section>

        <footer className={styles.footer}>
          <div className={styles.container}>
            <div className={styles.footerInner}>
              <Link href="/" className={styles.footerBrand} aria-label={`Reziphay ${messages.navigation.home}`}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="3" y="3" width="8" height="8" rx="1.5" />
                  <rect x="13" y="3" width="8" height="8" rx="1.5" opacity="0.6" />
                  <rect x="3" y="13" width="8" height="8" rx="1.5" opacity="0.6" />
                  <rect x="13" y="13" width="8" height="8" rx="1.5" opacity="0.35" />
                </svg>
                Reziphay
              </Link>

              <nav className={styles.footerLinks} aria-label={messages.navigationAriaLabel}>
                <Link href="/about" className={styles.footerLink}>{messages.navigation.aboutUs}</Link>
                <Link href="/questions" className={styles.footerLink}>{messages.navigation.questions}</Link>
                <Link href="/contact" className={styles.footerLink}>{messages.navigation.contactUs}</Link>
                <Link href="/auth/login" className={styles.footerLink}>{messages.auth.login.submit}</Link>
                <Link href="/auth/register" className={styles.footerLink}>{messages.auth.login.signUp}</Link>
              </nav>

              <p className={styles.footerCopy}>© {new Date().getFullYear()} Reziphay</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
