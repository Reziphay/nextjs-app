import { providerBenefits, providerJourney } from "@/content/site";
import { createMetadata } from "@/features/seo/metadata";

import { CtaBand } from "@/components/sections/cta-band";
import { IconCardGrid } from "@/components/sections/icon-card-grid";
import { PageHero } from "@/components/sections/page-hero";
import { Reveal } from "@/components/sections/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { SectionShell } from "@/components/sections/section-shell";
import { Badge } from "@/components/ui/badge";
import { ProviderInterestForm } from "@/features/forms/provider-interest-form";

export const metadata = createMetadata({
  title: "For providers",
  description:
    "Show service owners and brands how Reziphay supports visibility, flexible reservation demand, and provider-led operations.",
  path: "/for-providers",
});

export default function ForProvidersPage() {
  return (
    <>
      <PageHero
        hero={{
          eyebrow: "For service providers",
          title: "Give providers more visibility without forcing them into a one-size-fits-all booking workflow.",
          description:
            "Reziphay helps independent professionals, teams, and brands present services clearly and manage reservation demand through a flexible mobile-first flow.",
        }}
        actions={null}
        aside={
          <div className="space-y-4">
            <Badge>Provider value</Badge>
            <ul className="space-y-3 text-sm leading-6 text-muted">
              <li>Build a brand or operate under your own name.</li>
              <li>Keep approval logic and waiting rules under provider control.</li>
              <li>Capture demand from both SEO traffic and app-native discovery.</li>
            </ul>
          </div>
        }
      />

      <SectionShell>
        <SectionHeading
          eyebrow="Provider benefits"
          title="Explain why the platform respects real service operations."
          description="The key message is not automation for its own sake. The key message is better visibility and cleaner demand handling."
        />
        <div className="mt-8">
          <IconCardGrid items={providerBenefits} />
        </div>
      </SectionShell>

      <SectionShell tone="surface">
        <div className="grid gap-8 rounded-[2rem] px-6 py-8 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
          <div className="space-y-6">
            <SectionHeading
              eyebrow="Provider flow"
              title="Show the setup path from brand creation to reservation handling."
              description="The website should clarify how providers join, configure services, and keep control over approvals and changes."
            />
            <div className="space-y-4">
              {providerJourney.map((step, index) => (
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

          <div className="rounded-[1.75rem] border border-border/80 bg-white p-6 shadow-[var(--shadow-card)]">
            <SectionHeading
              eyebrow="Provider interest form"
              title="Capture high-intent business leads"
              description="Use this form for early providers, launch outreach, or partnership demand."
            />
            <div className="mt-6">
              <ProviderInterestForm />
            </div>
          </div>
        </div>
      </SectionShell>

      <SectionShell>
        <CtaBand
          description="Provider messaging should emphasize visibility, flexibility, and trust-building instead of generic software jargon."
          title="Turn provider traffic into qualified interest, not just passive page views."
        />
      </SectionShell>
    </>
  );
}

