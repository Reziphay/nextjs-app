import { customerJourney, providerJourney } from "@/content/site";
import { createMetadata } from "@/features/seo/metadata";

import { CtaBand } from "@/components/sections/cta-band";
import { PageHero } from "@/components/sections/page-hero";
import { Reveal } from "@/components/sections/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { SectionShell } from "@/components/sections/section-shell";
import { Badge } from "@/components/ui/badge";

export const metadata = createMetadata({
  title: "How it works",
  description:
    "See how customer discovery, provider setup, reservation requests, and flexible approvals work across the Reziphay product.",
  path: "/how-it-works",
});

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        hero={{
          eyebrow: "How it works",
          title: "A clear product story for customers, providers, and future operations teams.",
          description:
            "This route explains what happens in the mobile product, what the website is responsible for, and where product boundaries stay intentionally strict.",
        }}
        actions={null}
        aside={
          <div className="space-y-4">
            <Badge>Product truth</Badge>
            <ul className="space-y-3 text-sm leading-6 text-muted">
              <li>Reservations are requested through the mobile app.</li>
              <li>Providers can keep manual approval and flexible workflow rules.</li>
              <li>Reviews follow completed reservations, not generic public comments.</li>
            </ul>
          </div>
        }
      />

      <SectionShell>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <SectionHeading
              eyebrow="Customer journey"
              title="Service seekers move from discovery to request tracking."
              description="The app helps people compare options, inspect service detail, and send a reservation request with better context."
            />
            <div className="space-y-4">
              {customerJourney.map((step, index) => (
                <Reveal key={step.title}>
                  <div className="rounded-[1.5rem] border border-border/80 bg-card p-5 shadow-[var(--shadow-card)]">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-strong">
                      Customer {index + 1}
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
              eyebrow="Provider journey"
              title="Service owners control how demand is accepted and completed."
              description="The provider side is designed around configuration, visibility, and operational flexibility."
            />
            <div className="space-y-4">
              {providerJourney.map((step, index) => (
                <Reveal key={step.title}>
                  <div className="rounded-[1.5rem] border border-border/80 bg-card p-5 shadow-[var(--shadow-card)]">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-strong">
                      Provider {index + 1}
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

      <SectionShell tone="surface">
        <div className="rounded-[2rem] px-6 py-8 sm:px-8 lg:px-10">
          <SectionHeading
            eyebrow="Rules that stay explicit"
            title="Do not let the website imply the wrong workflow."
            description="These are the rules the marketing surface must reinforce consistently."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "No payment or deposit collection",
                copy:
                  "The product does not act as a checkout system. Keep copy and CTA language away from payment expectations.",
              },
              {
                title: "Suggested time does not equal guaranteed lock",
                copy:
                  "Availability signals are not a promise that the web or app has frozen a slot in inventory for the customer.",
              },
              {
                title: "Completed reservations unlock reviews",
                copy:
                  "Trust grows from actual service completion rather than open-ended comment flows detached from usage.",
              },
            ].map((rule) => (
              <div
                className="rounded-[1.5rem] border border-border/80 bg-white p-5 shadow-[var(--shadow-card)]"
                key={rule.title}
              >
                <h3 className="text-lg font-semibold">{rule.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{rule.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell>
        <CtaBand
          description="Use this route to remove friction for both sides before they ever reach the app stores."
          title="A strong 'how it works' page protects the product story and improves conversion quality."
        />
      </SectionShell>
    </>
  );
}

