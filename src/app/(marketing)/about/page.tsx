import { aboutPrinciples } from "@/content/site";
import { createMetadata } from "@/features/seo/metadata";

import { CtaBand } from "@/components/sections/cta-band";
import { IconCardGrid } from "@/components/sections/icon-card-grid";
import { PageHero } from "@/components/sections/page-hero";
import { SectionHeading } from "@/components/sections/section-heading";
import { SectionShell } from "@/components/sections/section-shell";

export const metadata = createMetadata({
  title: "About",
  description:
    "Understand how Reziphay positions the website, mobile app, trust model, and growth strategy for flexible service reservations.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageHero
        hero={{
          eyebrow: "About Reziphay",
          title: "A reservation platform that keeps growth surfaces honest.",
          description:
            "Reziphay is designed around service discovery, provider visibility, and flexible reservation requests. The website exists to explain, convert, and prepare future SEO scale without distorting the real product.",
        }}
        actions={null}
        aside={
          <div className="space-y-4 text-sm leading-6 text-muted">
            <p>The app is the operational center.</p>
            <p>The website is the brand, SEO, and acquisition layer.</p>
            <p>Trust grows from completed-service reviews and clear product boundaries.</p>
          </div>
        }
      />

      <SectionShell>
        <SectionHeading
          eyebrow="Core principles"
          title="The product story stays stronger when the website does not overclaim."
          description="These principles shape how content, routes, and CTA logic should be built."
        />
        <div className="mt-8">
          <IconCardGrid items={aboutPrinciples} />
        </div>
      </SectionShell>

      <SectionShell tone="surface">
        <div className="rounded-[2rem] px-6 py-8 sm:px-8 lg:px-10">
          <SectionHeading
            eyebrow="Positioning"
            title="Reziphay is not limited to one sector, city, or provider model."
            description="The platform can support many service categories while preserving one consistent idea: flexible, mobile-first reservation management without unnecessary operational rigidity."
          />
        </div>
      </SectionShell>

      <SectionShell>
        <CtaBand
          description="Use the about page to deepen trust, not to repeat homepage copy word-for-word."
          title="Position the brand with clarity, not vague marketplace language."
        />
      </SectionShell>
    </>
  );
}

