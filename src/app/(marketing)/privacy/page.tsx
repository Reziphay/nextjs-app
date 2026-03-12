import { privacySections } from "@/content/site";
import { createMetadata } from "@/features/seo/metadata";

import { PageHero } from "@/components/sections/page-hero";
import { SectionShell } from "@/components/sections/section-shell";

export const metadata = createMetadata({
  title: "Privacy",
  description:
    "Read the Reziphay website privacy summary covering contact forms, provider interest collection, and marketing analytics.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        hero={{
          eyebrow: "Privacy",
          title: "A concise privacy layer for the public marketing website.",
          description:
            "This page covers what the website may collect, why it is collected, and how launch-oriented website interactions should be handled.",
        }}
        actions={null}
        aside={
          <div className="space-y-3 text-sm leading-6 text-muted">
            <p>Form submissions are scoped to website follow-up and demand capture.</p>
            <p>Mobile product and backend privacy layers can expand separately.</p>
          </div>
        }
      />

      <SectionShell>
        <div className="space-y-4">
          {privacySections.map((section) => (
            <article
              className="rounded-[1.75rem] border border-border/80 bg-card p-6 shadow-[var(--shadow-card)]"
              key={section.title}
            >
              <h2 className="font-display text-2xl font-semibold">{section.title}</h2>
              <div className="mt-4 space-y-3 text-sm leading-6 text-muted">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {section.bullets ? (
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </SectionShell>
    </>
  );
}

