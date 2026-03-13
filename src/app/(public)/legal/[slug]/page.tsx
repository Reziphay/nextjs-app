import { notFound } from "next/navigation";

import { legalDocuments } from "@/features/marketing/content";
import { buildMetadata } from "@/lib/config/site";

type LegalPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return Object.keys(legalDocuments).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: LegalPageProps) {
  const { slug } = await params;
  const document = legalDocuments[slug as keyof typeof legalDocuments];

  if (!document) {
    return {};
  }

  return buildMetadata({
    title: document.title,
    description: `${document.title} for the Reziphay website.`,
    path: `/legal/${slug}`,
  });
}

export default async function LegalPage({ params }: LegalPageProps) {
  const { slug } = await params;
  const document = legalDocuments[slug as keyof typeof legalDocuments];

  if (!document) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-[880px] px-4 py-16 sm:px-6 lg:py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
        Legal
      </p>
      <h1 className="mt-4 text-5xl font-semibold tracking-[-0.05em] text-[var(--color-ink)]">
        {document.title}
      </h1>
      <p className="mt-4 text-sm text-[var(--color-ink-muted)]">
        Updated {document.updatedAt}
      </p>
      <div className="mt-10 space-y-10 rounded-[32px] border border-[var(--color-border)] bg-white p-8 shadow-[var(--shadow-soft)]">
        {document.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
              {section.heading}
            </h2>
            <p className="mt-4 text-sm leading-8 text-[var(--color-ink-muted)]">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </main>
  );
}
