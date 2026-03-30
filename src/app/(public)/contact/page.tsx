import { PageIntroPanel } from "@/components/marketing/page-intro-panel";
import { Card } from "@/components/ui/card";
import { ContactForm } from "@/features/contact/contact-form";
import { buildMetadata, siteConfig } from "@/lib/config/site";

export const metadata = buildMetadata({
  title: "Contact and support",
  description: "Simple support and provider inquiry page with validated contact form.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <PageIntroPanel
        eyebrow="Support"
        title="Keep support clear and lightweight"
        description="This surface is for general questions, provider onboarding inquiries, and trust-related follow-up."
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <ContactForm />
        <div className="grid gap-6">
          <Card tone="soft">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
              Email
            </p>
            <p className="mt-4 text-lg font-semibold text-[var(--color-ink)]">
              {siteConfig.contactEmail}
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--color-ink-muted)]">
              Use this for provider questions, policy clarifications, or product
              feedback.
            </p>
          </Card>
          <Card tone="subtle">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
              FAQ shortcut
            </p>
            <p className="mt-4 text-sm leading-7 text-[var(--color-ink-muted)]">
              The FAQ already answers the core questions around payments,
              schedule flexibility, reviews, and sponsored visibility.
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
}
