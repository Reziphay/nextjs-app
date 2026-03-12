import { termsSections } from "@/content/site";
import { createMetadata } from "@/features/seo/metadata";

import { PageHero } from "@/components/sections/page-hero";
import { SectionShell } from "@/components/sections/section-shell";

export const metadata = createMetadata({
  title: "Terms",
  description:
    "Read the website terms summary for the Reziphay public marketing surface, including product boundaries and future integration notes.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <PageHero
        hero={{
          eyebrow: "Terms",
          title: "A simple terms summary for the marketing website.",
          description:
            "These terms focus on what the website is for, what it does not provide, and how future integrations can expand without changing the website's public role.",
        }}
        actions={null}
        aside={
          <div className="space-y-3 text-sm leading-6 text-muted">
            <p>The website is informational, SEO-driven, and conversion-focused.</p>
            <p>Reservation operations remain centered in the mobile product.</p>
          </div>
        }
      />

      <SectionShell>
        <div className="space-y-4">
          {termsSections.map((section) => (
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
            </article>
          ))}
        </div>
      </SectionShell>
    </>
  );
}

