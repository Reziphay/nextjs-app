import Link from "next/link";

import { FAQAccordion } from "@/components/marketing/faq-accordion";
import { ProductPreview } from "@/components/marketing/product-preview";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  featuredCategories,
  faqGroups,
  howItWorks,
  trustHighlights,
} from "@/features/marketing/content";
import { buildMetadata } from "@/lib/config/site";

export const metadata = buildMetadata({
  title: "Flexible reservation website",
  description:
    "Marketing and acquisition surface for Reziphay, built around trust, flexibility, and clear provider control.",
  path: "/",
});

export default function LandingPage() {
  return (
    <main className="pb-10">
      <section className="mx-auto grid max-w-[1240px] items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:px-8 lg:py-24">
        <div className="flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
            Mobile-first reservation utility
          </p>
          <h1 className="mt-6 text-5xl font-semibold tracking-[-0.05em] text-[var(--color-ink)] md:text-6xl">
            Flexible reservations for services that do not fit rigid slot engines.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-9 text-[var(--color-ink-muted)]">
            Reziphay helps customers discover trusted services and helps providers
            receive reservation requests without losing control over how they work.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/download" className={buttonStyles({ kind: "primary" })}>
              Get the app
            </Link>
            <Link
              href="/for-businesses"
              className={buttonStyles({ kind: "secondary" })}
            >
              For businesses
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {trustHighlights.map((item) => (
              <Card key={item.title} className="rounded-[22px] border-white/70 p-5">
                <p className="font-medium text-[var(--color-ink)]">{item.title}</p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-ink-muted)]">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
        <ProductPreview />
      </section>

      <section className="mx-auto max-w-[1240px] px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="One product, two clear web responsibilities"
          description="The website explains and acquires. The hidden admin keeps moderation, analytics, and visibility management practical."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {howItWorks.map((item, index) => (
            <Card key={item.title} className="border-white/70">
              <p className="text-sm font-semibold text-[var(--color-primary)]">
                0{index + 1}
              </p>
              <h2 className="mt-6 text-xl font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--color-ink-muted)]">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-[32px] border border-[var(--color-border)] bg-[var(--color-card)] p-8 shadow-[var(--shadow-soft)] backdrop-blur-sm lg:grid-cols-[0.75fr_1.25fr] lg:p-12">
          <SectionHeading
            eyebrow="Use cases"
            title="Built for any reservation-led service"
            description="Reziphay is sector-agnostic in MVP. The discovery experience adapts without pretending every business works the same way."
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {featuredCategories.map((category) => (
              <div
                key={category}
                className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-paper)] px-5 py-6 text-sm font-medium text-[var(--color-ink)]"
              >
                {category}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-[32px] bg-[var(--color-panel-dark)] px-8 py-10 text-[var(--color-paper)] shadow-[var(--shadow-soft)] lg:grid-cols-[1.2fr_0.8fr] lg:px-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
              Product philosophy
            </p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em]">
              The platform coordinates reservations. It does not run the business
              for the provider.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/72">
              That distinction matters across copy, UI, and admin tooling.
              Reziphay supports discovery, requests, trust, and visibility without
              turning into a payment-first marketplace or a heavy calendar suite.
            </p>
          </div>
          <div className="grid gap-4">
            <Card className="border-white/10 bg-white/5 text-[var(--color-paper)]">
              <p className="font-medium">No payment flow</p>
              <p className="mt-2 text-sm leading-7 text-white/70">
                Revenue is centered on sponsored visibility, not checkout.
              </p>
            </Card>
            <Card className="border-white/10 bg-white/5 text-[var(--color-paper)]">
              <p className="font-medium">Quality through behavior</p>
              <p className="mt-2 text-sm leading-7 text-white/70">
                Reviews, moderation, and response patterns shape trust over time.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Answer the big questions early"
          description="The public website should make the product stance obvious in seconds, especially around flexibility, trust, and the absence of online payments."
        />
        <div className="mt-10">
          <FAQAccordion groups={faqGroups} />
        </div>
      </section>
    </main>
  );
}
