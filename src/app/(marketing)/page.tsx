import Link from "next/link";
import { Clock3, MessageSquare, Shield } from "lucide-react";

import {
  customerBenefits,
  customerJourney,
  faqItems,
  featuredCategories,
  homeHero,
  homeSignals,
  providerBenefits,
  providerJourney,
  reservationPhilosophy,
} from "@/content/site";
import { absoluteUrl, siteConfig } from "@/config/site";
import { createMetadata } from "@/features/seo/metadata";
import { StructuredData } from "@/features/seo/structured-data";

import { CtaLink } from "@/components/marketing/cta-link";
import { CtaBand } from "@/components/sections/cta-band";
import { FaqAccordion } from "@/components/sections/faq-accordion";
import { HighlightStrip } from "@/components/sections/highlight-strip";
import { IconCardGrid } from "@/components/sections/icon-card-grid";
import { PageHero } from "@/components/sections/page-hero";
import { Reveal } from "@/components/sections/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { SectionShell } from "@/components/sections/section-shell";
import { Badge } from "@/components/ui/badge";

export const metadata = createMetadata({
  description: siteConfig.description,
  keywords: [
    "reservation platform",
    "service discovery app",
    "provider marketing site",
    "mobile booking requests",
  ],
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <StructuredData
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: siteConfig.name,
            url: siteConfig.url,
            email: siteConfig.contactEmail,
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: siteConfig.name,
            url: siteConfig.url,
            description: siteConfig.description,
          },
          {
            "@context": "https://schema.org",
            "@type": "MobileApplication",
            applicationCategory: "BusinessApplication",
            description: siteConfig.description,
            downloadUrl: [siteConfig.app.iosUrl, siteConfig.app.androidUrl],
            name: siteConfig.name,
            operatingSystem: "iOS, Android",
          },
        ]}
      />

      <PageHero
        hero={homeHero}
        actions={
          <>
            <CtaLink
              analyticsEvent={{
                name: "hero_cta_click",
                properties: {
                  ctaLabel: "Download flow",
                  destination: "/download",
                  surface: "home-hero",
                },
              }}
              href="/download"
            >
              Download flow
            </CtaLink>
            <CtaLink
              analyticsEvent={{
                name: "hero_cta_click",
                properties: {
                  ctaLabel: "For providers",
                  destination: "/for-providers",
                  surface: "home-hero",
                },
              }}
              href="/for-providers"
              variant="outline"
            >
              For providers
            </CtaLink>
          </>
        }
        aside={
          <div className="grid gap-4">
            <div className="rounded-[1.5rem] border border-accent/15 bg-white p-5">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-accent" />
                <p className="font-semibold">App-led reservation requests</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">
                The web layer explains the product and moves intent forward. The
                mobile app handles discovery and request status.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-accent/15 bg-white p-5">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-accent" />
                <p className="font-semibold">No payment lock-in</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">
                Reziphay does not collect payments or deposits. It stays focused on
                service discovery, visibility, and reservation coordination.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-accent/15 bg-white p-5">
              <div className="flex items-center gap-3">
                <Clock3 className="h-5 w-5 text-accent" />
                <p className="font-semibold">Provider-led scheduling truth</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">
                Suggested times stay flexible. Providers keep control over approval
                windows and working patterns.
              </p>
            </div>
          </div>
        }
        caption="Reziphay.com is the growth surface. The app remains the core reservation product."
      />

      <SectionShell>
        <HighlightStrip items={homeSignals} />
      </SectionShell>

      <SectionShell>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <SectionHeading
              eyebrow="For customers"
              title="Show why service seekers should trust the discovery flow."
              description="Explain nearby discovery, provider comparison, and reservation requests without pretending the website is the booking engine."
            />
            <IconCardGrid columns="two" items={customerBenefits} />
          </div>
          <div className="space-y-6">
            <SectionHeading
              eyebrow="For providers"
              title="Show why service owners can adopt the platform without changing how they work."
              description="Position Reziphay as a visibility and coordination layer rather than a rigid operational takeover."
            />
            <IconCardGrid columns="two" items={providerBenefits} />
          </div>
        </div>
      </SectionShell>

      <SectionShell tone="surface">
        <div className="grid gap-8 rounded-[2rem] px-6 py-8 sm:px-8 lg:grid-cols-2 lg:px-10">
          <div className="space-y-6">
            <SectionHeading
              eyebrow="Customer flow"
              title="Discovery to reservation request"
              description="The app helps customers move from searching to requesting and tracking, while the website prepares them with trust-building context."
            />
            <div className="space-y-4">
              {customerJourney.map((step, index) => (
                <Reveal delay={index * 0.08} key={step.title}>
                  <div className="rounded-[1.5rem] border border-border/80 bg-white p-5">
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
          <div className="space-y-6">
            <SectionHeading
              eyebrow="Provider flow"
              title="Visibility, service setup, and request handling"
              description="Providers shape services, approval rules, and team visibility from the mobile product while the website captures demand."
            />
            <div className="space-y-4">
              {providerJourney.map((step, index) => (
                <Reveal delay={index * 0.08} key={step.title}>
                  <div className="rounded-[1.5rem] border border-border/80 bg-white p-5">
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
        </div>
      </SectionShell>

      <SectionShell>
        <SectionHeading
          eyebrow="Product philosophy"
          title="Keep the product promise accurate from the first screen."
          description="The public website should actively prevent the wrong mental model around payments, hard-locked slots, or a web-based booking dashboard."
        />
        <div className="mt-8">
          <IconCardGrid items={reservationPhilosophy} />
        </div>
      </SectionShell>

      <SectionShell tone="surface">
        <div className="rounded-[2rem] px-6 py-8 sm:px-8 lg:px-10">
          <SectionHeading
            eyebrow="Category-ready growth"
            title="Use categories as future SEO and acquisition surfaces."
            description="Barbershops, dental clinics, beauty studios, and wellness services are starting points. The architecture is designed to scale far beyond them."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {featuredCategories.map((category) => (
              <Reveal key={category.slug}>
                <Link
                  className="block rounded-[1.75rem] border border-border/80 bg-white p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:border-accent/30"
                  href={`/categories/${category.slug}`}
                >
                  <Badge>{category.name}</Badge>
                  <h3 className="mt-4 text-xl font-semibold tracking-tight">
                    {category.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-muted">
                    {category.description}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell>
        <CtaBand
          description="Move visitors toward the mobile app, app launch updates, or provider interest without making the site feel like a dead-end brochure."
          title="Build one website that explains, converts, and stays aligned with the real product."
        />
      </SectionShell>

      <SectionShell>
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading
            eyebrow="FAQ preview"
            title="Answer the highest-risk product questions early."
            description="The fastest way to reduce confusion is to state what Reziphay does, what it does not do, and where the reservation flow actually lives."
          />
          <FaqAccordion items={faqItems.slice(0, 5)} surface="home-faq-preview" />
        </div>
      </SectionShell>

      <SectionShell>
        <div className="container-shell pb-2">
          <StructuredData
            data={{
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: absoluteUrl("/"),
                },
              ],
            }}
          />
        </div>
      </SectionShell>
    </>
  );
}
