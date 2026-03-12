import Link from "next/link";

import {
  customerBenefits,
  customerJourney,
  featuredCategories,
} from "@/content/site";
import { createMetadata } from "@/features/seo/metadata";

import { CtaLink } from "@/components/marketing/cta-link";
import { CtaBand } from "@/components/sections/cta-band";
import { IconCardGrid } from "@/components/sections/icon-card-grid";
import { PageHero } from "@/components/sections/page-hero";
import { Reveal } from "@/components/sections/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { SectionShell } from "@/components/sections/section-shell";
import { Badge } from "@/components/ui/badge";

export const metadata = createMetadata({
  title: "For customers",
  description:
    "See how Reziphay helps service seekers discover nearby services, compare providers, and request reservations through the mobile app.",
  path: "/for-customers",
});

export default function ForCustomersPage() {
  return (
    <>
      <PageHero
        hero={{
          eyebrow: "For service seekers",
          title: "Help people discover the right service before they send a reservation request.",
          description:
            "Reziphay gives customers a better path to compare providers, understand quality signals, and request a reservation without needing a rigid web booking system.",
        }}
        actions={
          <>
            <CtaLink href="/download">Get launch updates</CtaLink>
            <CtaLink href="/faq" variant="outline">
              Read booking FAQ
            </CtaLink>
          </>
        }
        aside={
          <div className="space-y-4">
            <Badge>Customer value</Badge>
            <ul className="space-y-3 text-sm leading-6 text-muted">
              <li>Compare providers with review and category context.</li>
              <li>Explore nearby options and brand-level visibility.</li>
              <li>Track requests and changes through the app experience.</li>
            </ul>
          </div>
        }
      />

      <SectionShell>
        <SectionHeading
          eyebrow="Customer benefits"
          title="Show the signals people actually use to choose a provider."
          description="The website should explain why Reziphay is useful before the user even opens the app."
        />
        <div className="mt-8">
          <IconCardGrid items={customerBenefits} />
        </div>
      </SectionShell>

      <SectionShell tone="surface">
        <div className="rounded-[2rem] px-6 py-8 sm:px-8 lg:px-10">
          <SectionHeading
            eyebrow="Customer flow"
            title="What the customer journey needs to make clear"
            description="Discovery, service detail, request, and status tracking should feel simple and truthful."
          />
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {customerJourney.map((step, index) => (
              <Reveal key={step.title}>
                <div className="rounded-[1.5rem] border border-border/80 bg-white p-5 shadow-[var(--shadow-card)]">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-strong">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted">
                    {step.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell>
        <SectionHeading
          eyebrow="Category paths"
          title="Guide high-intent visitors into a relevant category."
          description="Category landing pages can connect discovery intent with the mobile product and the provider network."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featuredCategories.map((category) => (
            <Link
              className="rounded-[1.5rem] border border-border/80 bg-card p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:border-accent/30"
              href={`/categories/${category.slug}`}
              key={category.slug}
            >
              <Badge>{category.name}</Badge>
              <h3 className="mt-4 text-lg font-semibold">{category.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </SectionShell>

      <SectionShell>
        <CtaBand
          description="Keep customer messaging centered on discovery, trust, and request simplicity."
          title="The website should answer: why should I trust this app to help me choose?"
        />
      </SectionShell>
    </>
  );
}

