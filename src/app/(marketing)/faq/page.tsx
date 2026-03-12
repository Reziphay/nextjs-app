import { faqItems } from "@/content/site";
import { createMetadata } from "@/features/seo/metadata";
import { StructuredData } from "@/features/seo/structured-data";

import { CtaBand } from "@/components/sections/cta-band";
import { FaqAccordion } from "@/components/sections/faq-accordion";
import { PageHero } from "@/components/sections/page-hero";
import { SectionShell } from "@/components/sections/section-shell";

export const metadata = createMetadata({
  title: "FAQ",
  description:
    "Read the most important answers about Reziphay, including website scope, payment boundaries, reviews, providers, and reservation logic.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }}
      />
      <PageHero
        hero={{
          eyebrow: "FAQ",
          title: "Answer the questions that could otherwise lower trust or conversion.",
          description:
            "This page should make product boundaries explicit: no payments, no fake web booking engine, no hard-locked availability claims.",
        }}
        actions={null}
        aside={
          <div className="space-y-3 text-sm leading-6 text-muted">
            <p>Use FAQ to reduce confusion before app downloads.</p>
            <p>Keep answers honest, product-led, and short.</p>
            <p>Route unresolved questions to the contact page.</p>
          </div>
        }
      />

      <SectionShell>
        <FaqAccordion items={faqItems} surface="faq-page" />
      </SectionShell>

      <SectionShell>
        <CtaBand
          description="FAQ content should support both SEO and trust, not exist as filler."
          title="If users know the product boundaries, they convert with fewer surprises."
        />
      </SectionShell>
    </>
  );
}
