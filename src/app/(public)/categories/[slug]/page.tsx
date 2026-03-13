import Link from "next/link";
import { notFound } from "next/navigation";

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
      <div className="grid gap-8 rounded-[32px] border border-[var(--color-border)] bg-white p-8 shadow-[var(--shadow-soft)] lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
            SEO landing template
          </p>
          <h1 className="mt-5 text-5xl font-semibold tracking-[-0.05em] text-[var(--color-ink)]">
            {page.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-9 text-[var(--color-ink-muted)]">
            {page.intro}
          </p>
          <div className="mt-8 flex gap-4">
            <Link href="/download" className={buttonStyles({ kind: "primary" })}>
              Download the app
            </Link>
            <Link href="/faq" className={buttonStyles({ kind: "secondary" })}>
              Read the FAQ
            </Link>
          </div>
        </div>
        <Card className="bg-[var(--color-surface)]">
          <p className="font-medium text-[var(--color-ink)]">Template rules</p>
          <p className="mt-4 text-sm leading-8 text-[var(--color-ink-muted)]">
            Keep future SEO pages restrained, useful, and internally linked. Do
            not generate spammy permutations by default.
          </p>
        </Card>
      </div>
    </main>
  );
}
