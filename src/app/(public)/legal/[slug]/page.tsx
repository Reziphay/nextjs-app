import { notFound } from "next/navigation";

import { PageIntroPanel } from "@/components/marketing/page-intro-panel";
import { Card } from "@/components/ui/card";
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
      <PageIntroPanel
        eyebrow="Legal"
        title={document.title}
        description={`Updated ${document.updatedAt}`}
        className="p-7 sm:p-8"
      />
      <Card tone="soft" className="mt-10 space-y-10 p-8">
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
      </Card>
    </main>
  );
}
