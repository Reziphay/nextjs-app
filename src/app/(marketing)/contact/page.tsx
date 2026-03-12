import { siteConfig } from "@/config/site";
import { createMetadata } from "@/features/seo/metadata";

import { ContactForm } from "@/features/forms/contact-form";

import { PageHero } from "@/components/sections/page-hero";
import { SectionHeading } from "@/components/sections/section-heading";
import { SectionShell } from "@/components/sections/section-shell";
import { Badge } from "@/components/ui/badge";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function mapIntentToInterest(value?: string) {
  switch (value) {
    case "app-launch":
    case "ios-launch-updates":
    case "android-launch-updates":
      return "app-download" as const;
    case "provider":
      return "provider-partnership" as const;
    case "support":
      return "customer-support" as const;
    default:
      return "general" as const;
  }
}

export const metadata = createMetadata({
  title: "Contact",
  description:
    "Contact the Reziphay team for launch updates, provider partnership interest, and general product questions.",
  path: "/contact",
});

export default async function ContactPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const intent =
    typeof resolvedSearchParams.intent === "string"
      ? resolvedSearchParams.intent
      : undefined;

  return (
    <>
      <PageHero
        hero={{
          eyebrow: "Contact",
          title: "Give visitors a clean path for questions, launch updates, and provider outreach.",
          description:
            "The website needs a conversion-safe contact surface with clear routing for customer questions, provider demand, and launch notifications.",
        }}
        actions={null}
        aside={
          <div className="space-y-4">
            <Badge>Reach the team</Badge>
            <ul className="space-y-3 text-sm leading-6 text-muted">
              <li>Email: {siteConfig.contactEmail}</li>
              <li>Use the provider route for business onboarding interest.</li>
              <li>Use app launch intent for store and download updates.</li>
            </ul>
          </div>
        }
      />

      <SectionShell>
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[1.75rem] border border-border/80 bg-card p-6 shadow-[var(--shadow-card)]">
            <SectionHeading
              eyebrow="Contact form"
              title="Capture context before the team follows up."
              description="Validation, success states, and intent tagging keep the form useful instead of generic."
            />
            <div className="mt-6">
              <ContactForm defaultInterest={mapIntentToInterest(intent)} />
            </div>
          </div>

          <div className="grid gap-4">
            {[
              {
                title: "Launch updates",
                copy:
                  "Use this route for App Store and Google Play release notifications or launch timing follow-up.",
              },
              {
                title: "Provider outreach",
                copy:
                  "If the person is a business owner or brand operator, the dedicated provider-interest route is a better conversion path.",
              },
              {
                title: "Support and product questions",
                copy:
                  "The form can collect product questions while the public site still stays light and conversion-focused.",
              },
            ].map((item) => (
              <div
                className="rounded-[1.5rem] border border-border/80 bg-card p-5 shadow-[var(--shadow-card)]"
                key={item.title}
              >
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionShell>
    </>
  );
}

