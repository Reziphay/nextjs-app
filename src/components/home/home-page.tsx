import Link from "next/link";
import type { Messages } from "@/i18n/config";
import { AuthLayoutTemplate } from "@/components/templates";

type HomePageProps = {
  apiBaseUrl: string;
  messages: Messages;
};

const featureIcons = ["🏷️", "📍", "📅", "🌍", "🔐", "📊"] as const;
const stepNumbers = ["01", "02", "03"] as const;

export function HomePage({ messages }: HomePageProps) {
  const lp = messages.landing;

  const features = [
    { icon: featureIcons[0], title: lp.features.brandTitle, description: lp.features.brandDesc },
    { icon: featureIcons[1], title: lp.features.branchTitle, description: lp.features.branchDesc },
    { icon: featureIcons[2], title: lp.features.reservationsTitle, description: lp.features.reservationsDesc },
    { icon: featureIcons[3], title: lp.features.multilingualTitle, description: lp.features.multilingualDesc },
    { icon: featureIcons[4], title: lp.features.rolesTitle, description: lp.features.rolesDesc },
    { icon: featureIcons[5], title: lp.features.insightsTitle, description: lp.features.insightsDesc },
  ];

  const steps = [
    { number: stepNumbers[0], title: lp.howItWorks.step1Title, description: lp.howItWorks.step1Desc },
    { number: stepNumbers[1], title: lp.howItWorks.step2Title, description: lp.howItWorks.step2Desc },
    { number: stepNumbers[2], title: lp.howItWorks.step3Title, description: lp.howItWorks.step3Desc },
  ];

  const ownerFeatures = [
    lp.dualValue.ownerF1,
    lp.dualValue.ownerF2,
    lp.dualValue.ownerF3,
    lp.dualValue.ownerF4,
    lp.dualValue.ownerF5,
    lp.dualValue.ownerF6,
  ];

  const customerFeatures = [
    lp.dualValue.customerF1,
    lp.dualValue.customerF2,
    lp.dualValue.customerF3,
    lp.dualValue.customerF4,
    lp.dualValue.customerF5,
    lp.dualValue.customerF6,
  ];

  const pricingPlans = [
    {
      name: lp.pricing.starterName,
      price: lp.pricing.starterPrice,
      period: "",
      description: lp.pricing.starterDesc,
      cta: lp.pricing.starterCta,
      href: "/auth/register",
      featured: false,
      features: [
        lp.pricing.starterF1,
        lp.pricing.starterF2,
        lp.pricing.starterF3,
        lp.pricing.starterF4,
        lp.pricing.starterF5,
      ],
    },
    {
      name: lp.pricing.proName,
      price: lp.pricing.proPrice,
      period: lp.pricing.proPeriod,
      description: lp.pricing.proDesc,
      cta: lp.pricing.proCta,
      href: "/auth/register",
      featured: true,
      features: [
        lp.pricing.proF1,
        lp.pricing.proF2,
        lp.pricing.proF3,
        lp.pricing.proF4,
        lp.pricing.proF5,
        lp.pricing.proF6,
      ],
    },
    {
      name: lp.pricing.enterpriseName,
      price: lp.pricing.enterprisePrice,
      period: "",
      description: lp.pricing.enterpriseDesc,
      cta: lp.pricing.enterpriseCta,
      href: "/contact",
      featured: false,
      features: [
        lp.pricing.enterpriseF1,
        lp.pricing.enterpriseF2,
        lp.pricing.enterpriseF3,
        lp.pricing.enterpriseF4,
        lp.pricing.enterpriseF5,
        lp.pricing.enterpriseF6,
      ],
    },
  ];

  const faqs = [
    { question: lp.faq.q1, answer: lp.faq.a1 },
    { question: lp.faq.q2, answer: lp.faq.a2 },
    { question: lp.faq.q3, answer: lp.faq.a3 },
    { question: lp.faq.q4, answer: lp.faq.a4 },
    { question: lp.faq.q5, answer: lp.faq.a5 },
    { question: lp.faq.q6, answer: lp.faq.a6 },
  ];

  return (
    <AuthLayoutTemplate shellVariant="wide">
      <div className="landingPage">

        {/* ── Hero ─────────────────────────────────── */}
        <section className="lpHero">
          <span className="lpEyebrow">{lp.hero.eyebrow}</span>
          <h1 className="lpHeroTitle">
            {lp.hero.title}
            <br />
            <span className="lpHeroAccent">{lp.hero.titleAccent}</span>
          </h1>
          <p className="lpHeroLead">{lp.hero.description}</p>
          <div className="lpHeroCtas">
            <Link href="/auth/register" className="lpCtaPrimary">
              {lp.hero.ctaPrimary}
            </Link>
            <Link href="/auth/login" className="lpCtaOutline">
              {lp.hero.ctaSecondary}
            </Link>
          </div>
        </section>

        {/* ── Stats bar ────────────────────────────── */}
        <div className="lpStatsBar">
          <div className="lpStatItem">
            <span className="lpStatNumber">{lp.stats.languagesNumber}</span>
            <span className="lpStatLabel">{lp.stats.languagesLabel}</span>
          </div>
          <div className="lpStatDivider" />
          <div className="lpStatItem">
            <span className="lpStatNumber">{lp.stats.accountTypesNumber}</span>
            <span className="lpStatLabel">{lp.stats.accountTypesLabel}</span>
          </div>
          <div className="lpStatDivider" />
          <div className="lpStatItem">
            <span className="lpStatNumber">{lp.stats.availabilityNumber}</span>
            <span className="lpStatLabel">{lp.stats.availabilityLabel}</span>
          </div>
          <div className="lpStatDivider" />
          <div className="lpStatItem">
            <span className="lpStatNumber">{lp.stats.freeNumber}</span>
            <span className="lpStatLabel">{lp.stats.freeLabel}</span>
          </div>
        </div>

        {/* ── Features ─────────────────────────────── */}
        <section className="lpSection">
          <div className="lpSectionHeader">
            <span className="lpSectionLabel">{lp.features.sectionLabel}</span>
            <h2 className="lpSectionTitle">{lp.features.sectionTitle}</h2>
            <p className="lpSectionLead">{lp.features.sectionLead}</p>
          </div>
          <div className="lpFeaturesGrid">
            {features.map((f) => (
              <article key={f.title} className="lpFeatureCard">
                <span className="lpFeatureIcon">{f.icon}</span>
                <h3 className="lpFeatureTitle">{f.title}</h3>
                <p className="lpFeatureDesc">{f.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── How it works ─────────────────────────── */}
        <section className="lpSection lpSectionAlt">
          <div className="lpSectionHeader">
            <span className="lpSectionLabel">{lp.howItWorks.sectionLabel}</span>
            <h2 className="lpSectionTitle">{lp.howItWorks.sectionTitle}</h2>
            <p className="lpSectionLead">{lp.howItWorks.sectionLead}</p>
          </div>
          <div className="lpStepsGrid">
            {steps.map((s) => (
              <div key={s.number} className="lpStep">
                <span className="lpStepNumber">{s.number}</span>
                <h3 className="lpStepTitle">{s.title}</h3>
                <p className="lpStepDesc">{s.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Dual value props ─────────────────────── */}
        <section className="lpSection">
          <div className="lpSectionHeader">
            <span className="lpSectionLabel">{lp.dualValue.sectionLabel}</span>
            <h2 className="lpSectionTitle">{lp.dualValue.sectionTitle}</h2>
            <p className="lpSectionLead">{lp.dualValue.sectionLead}</p>
          </div>
          <div className="lpDualGrid">
            <div className="lpDualCard">
              <span className="lpDualBadge lpDualBadgePrimary">{lp.dualValue.ownerBadge}</span>
              <h3 className="lpDualTitle">{lp.dualValue.ownerTitle}</h3>
              <p className="lpDualDesc">{lp.dualValue.ownerDesc}</p>
              <ul className="lpFeatureList">
                {ownerFeatures.map((f) => (
                  <li key={f} className="lpFeatureListItem">
                    <span className="lpFeatureCheck">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register" className="lpCtaSecondary">
                {lp.dualValue.ownerCta}
              </Link>
            </div>
            <div className="lpDualCard lpDualCardAlt">
              <span className="lpDualBadge lpDualBadgeAccent">{lp.dualValue.customerBadge}</span>
              <h3 className="lpDualTitle">{lp.dualValue.customerTitle}</h3>
              <p className="lpDualDesc">{lp.dualValue.customerDesc}</p>
              <ul className="lpFeatureList">
                {customerFeatures.map((f) => (
                  <li key={f} className="lpFeatureListItem">
                    <span className="lpFeatureCheck">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register" className="lpCtaSecondary">
                {lp.dualValue.customerCta}
              </Link>
            </div>
          </div>
        </section>

        {/* ── Pricing ──────────────────────────────── */}
        <section className="lpSection lpSectionAlt" id="pricing">
          <div className="lpSectionHeader">
            <span className="lpSectionLabel">{lp.pricing.sectionLabel}</span>
            <h2 className="lpSectionTitle">{lp.pricing.sectionTitle}</h2>
            <p className="lpSectionLead">{lp.pricing.sectionLead}</p>
          </div>
          <div className="lpPricingGrid">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`lpPricingCard${plan.featured ? " lpPricingCardFeatured" : ""}`}
              >
                {plan.featured && (
                  <span className="lpPricingBadge">{lp.pricing.mostPopular}</span>
                )}
                <div className="lpPricingHeader">
                  <span className="lpPricingName">{plan.name}</span>
                  <div className="lpPricingPrice">
                    <span className="lpPricingAmount">{plan.price}</span>
                    {plan.period && (
                      <span className="lpPricingPeriod">{plan.period}</span>
                    )}
                  </div>
                  <p className="lpPricingDesc">{plan.description}</p>
                </div>
                <ul className="lpPricingFeatures">
                  {plan.features.map((f) => (
                    <li key={f} className="lpPricingFeatureItem">
                      <span className="lpPricingCheck">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={plan.featured ? "lpCtaPrimary lpCtaFull" : "lpCtaOutline lpCtaFull"}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────── */}
        <section className="lpSection" id="faq">
          <div className="lpSectionHeader">
            <span className="lpSectionLabel">{lp.faq.sectionLabel}</span>
            <h2 className="lpSectionTitle">{lp.faq.sectionTitle}</h2>
            <p className="lpSectionLead">
              {lp.faq.sectionLead}{" "}
              <Link href="/contact" className="lpInlineLink">
                {lp.faq.contactLink}
              </Link>
              .
            </p>
          </div>
          <div className="lpFaqList">
            {faqs.map((faq) => (
              <details key={faq.question} className="lpFaqItem">
                <summary className="lpFaqQuestion">
                  {faq.question}
                  <span className="lpFaqChevron" aria-hidden="true">›</span>
                </summary>
                <p className="lpFaqAnswer">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────── */}
        <section className="lpCtaSection">
          <div className="lpCtaSectionInner">
            <span className="lpEyebrow">{lp.finalCta.eyebrow}</span>
            <h2 className="lpCtaSectionTitle">{lp.finalCta.title}</h2>
            <p className="lpCtaSectionLead">{lp.finalCta.description}</p>
            <div className="lpHeroCtas">
              <Link href="/auth/register" className="lpCtaPrimary">
                {lp.finalCta.ctaPrimary}
              </Link>
              <Link href="/auth/login" className="lpCtaOutline">
                {lp.finalCta.ctaSecondary}
              </Link>
            </div>
          </div>
        </section>

      </div>
    </AuthLayoutTemplate>
  );
}
