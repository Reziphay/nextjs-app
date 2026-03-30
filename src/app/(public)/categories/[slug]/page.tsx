import Link from "next/link";
import { notFound } from "next/navigation";

import { PageIntroPanel } from "@/components/marketing/page-intro-panel";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { seoPages } from "@/features/marketing/content";
import { buildMetadata } from "@/lib/config/site";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return Object.keys(seoPages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const page = seoPages[slug as keyof typeof seoPages];

  if (!page) {
    return {};
  }

  return buildMetadata({
    title: page.title,
    description: page.intro,
    path: `/categories/${slug}`,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const page = seoPages[slug as keyof typeof seoPages];

  if (!page) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <PageIntroPanel
        eyebrow="SEO landing template"
        title={page.title}
        description={page.intro}
        actions={
          <>
            <Link href="/download" className={buttonStyles({ kind: "primary" })}>
              Download the app
            </Link>
            <Link href="/faq" className={buttonStyles({ kind: "secondary" })}>
              Read the FAQ
            </Link>
          </>
        }
        aside={
          <Card tone="subtle">
            <p className="font-medium text-[var(--color-ink)]">Template rules</p>
            <p className="mt-4 text-sm leading-8 text-[var(--color-ink-muted)]">
              Keep future SEO pages restrained, useful, and internally linked. Do
              not generate spammy permutations by default.
            </p>
          </Card>
        }
      />
    </main>
  );
}
