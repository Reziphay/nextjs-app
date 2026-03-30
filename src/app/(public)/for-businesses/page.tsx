import Link from "next/link";

import { PageIntroPanel } from "@/components/marketing/page-intro-panel";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  businessFeatures,
  providerOnboardingSteps,
} from "@/features/marketing/content";
import { ProviderInquiryForm } from "@/features/marketing/provider-inquiry-form";
import { buildMetadata } from "@/lib/config/site";

export const metadata = buildMetadata({
  title: "For businesses and providers",
  description: "Provider-focused acquisition page for brands and service owners.",
  path: "/for-businesses",
});

export default function ForBusinessesPage() {
  return (
    <main className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <PageIntroPanel
        eyebrow="Provider onboarding"
        title="Keep your reservation logic. Gain visibility and cleaner requests."
        description="Reziphay helps businesses receive reservation requests, manage brand visibility, and build trust without forcing a rigid scheduling engine."
        actions={
          <>
            <Link href="/download" className={buttonStyles({ kind: "primary" })}>
              Start in the app
            </Link>
            <Link href="/contact" className={buttonStyles({ kind: "secondary" })}>
              Talk to us
            </Link>
          </>
        }
        aside={
          <Card tone="dark">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
              Sponsored visibility
            </p>
            <p className="mt-4 text-lg font-semibold">
              The revenue model is placement and visibility, not payments.
            </p>
            <p className="mt-4 text-sm leading-7 text-white/72">
              Featured and sponsored surfaces help customers discover providers
              faster while leaving the payment relationship outside the platform.
            </p>
          </Card>
        }
      />
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {businessFeatures.map((item) => (
          <Card key={item.title} tone="soft">
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
              {item.title}
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--color-ink-muted)]">
              {item.description}
            </p>
          </Card>
        ))}
      </div>
      <section className="mt-16">
        <SectionHeading
          eyebrow="Onboarding"
          title="Move from interest to operational setup without fiction"
          description="The website should convert providers with realistic onboarding language, not generic booking-platform promises."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {providerOnboardingSteps.map((step, index) => (
            <Card key={step.title} tone="soft">
              <p className="text-sm font-semibold text-[var(--color-primary)]">
                0{index + 1}
              </p>
              <h2 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
                {step.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--color-ink-muted)]">
                {step.description}
              </p>
            </Card>
          ))}
        </div>
      </section>
      <section className="mt-16 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <ProviderInquiryForm />
        <div className="grid gap-6">
          <Card tone="dark">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
              What to expect
            </p>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-white/72">
              <li>Share your current reservation process and pain points.</li>
              <li>Clarify whether you work solo, in a team, or under one or more brands.</li>
              <li>Keep sponsorship and visibility discussions separate from payments.</li>
            </ul>
          </Card>
          <Card tone="soft">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
              Fast path
            </p>
            <p className="mt-4 text-sm leading-7 text-[var(--color-ink-muted)]">
              If you already know you want to proceed, go straight to the app and
              start the provider registration flow there.
            </p>
            <Link href="/download" className={`${buttonStyles({ kind: "secondary" })} mt-6`}>
              Go to app download
            </Link>
          </Card>
        </div>
      </section>
    </main>
  );
}
