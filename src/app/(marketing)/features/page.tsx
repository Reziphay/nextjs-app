import { featureGroups } from "@/content/site";
import { createMetadata } from "@/features/seo/metadata";

import { CtaBand } from "@/components/sections/cta-band";
import { IconCardGrid } from "@/components/sections/icon-card-grid";
import { PageHero } from "@/components/sections/page-hero";
import { SectionHeading } from "@/components/sections/section-heading";
import { SectionShell } from "@/components/sections/section-shell";

export const metadata = createMetadata({
  title: "Features",
  description:
    "Explore Reziphay features across discovery, reservation requests, notifications, provider operations, and marketing-site growth surfaces.",
  path: "/features",
});

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        hero={{
          eyebrow: "Feature overview",
          title: "A product system built around discovery, requests, and flexible provider control.",
          description:
            "The website explains the product clearly while the mobile app handles provider discovery, reservation requests, and operational status tracking.",
        }}
        actions={null}
        aside={
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.18em] text-accent-strong">
              Why this matters
            </p>
            <ul className="space-y-3 text-sm leading-6 text-muted">
              <li>Clear boundaries reduce false expectations.</li>
              <li>SEO and marketing pages stay aligned with product truth.</li>
              <li>Providers see flexibility, not forced operational overhaul.</li>
            </ul>
          </div>
        }
      />

      {featureGroups.map((group) => (
        <SectionShell key={group.title}>
          <SectionHeading
            description={group.description}
            eyebrow="Feature group"
            title={group.title}
          />
          <div className="mt-8">
            <IconCardGrid items={group.items} />
          </div>
        </SectionShell>
      ))}

      <SectionShell tone="surface">
        <div className="rounded-[2rem] px-6 py-8 sm:px-8 lg:px-10">
          <SectionHeading
            eyebrow="Website foundations"
            title="The public site is more than a hero page."
            description="The architecture also covers SEO pages, lead forms, app-download flow, analytics events, legal content, and a hidden admin gateway placeholder."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              "Category and city routes for scalable search demand capture.",
              "Contact and provider-interest forms with validated API routes.",
              "Centralized CTA tracking for key conversion moments.",
              "Metadata, sitemap, robots, and social preview foundations.",
            ].map((item) => (
              <div
                className="rounded-[1.5rem] border border-border/80 bg-white p-5 shadow-[var(--shadow-card)]"
                key={item}
              >
                <p className="text-sm leading-6 text-muted">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell>
        <CtaBand
          description="Show the full feature stack without turning the website into a fake dashboard demo."
          title="Use feature pages to deepen understanding and increase intent."
        />
      </SectionShell>
    </>
  );
}

