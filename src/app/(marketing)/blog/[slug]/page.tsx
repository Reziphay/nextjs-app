import { notFound } from "next/navigation";

import { blogPosts, getBlogPostBySlug } from "@/content/site";
import { absoluteUrl } from "@/config/site";
import { TrackPageEvent } from "@/features/analytics/track-page-event";
import { createMetadata } from "@/features/seo/metadata";
import { StructuredData } from "@/features/seo/structured-data";

import { CtaBand } from "@/components/sections/cta-band";
import { PageHero } from "@/components/sections/page-hero";
import { SectionShell } from "@/components/sections/section-shell";
import { Badge } from "@/components/ui/badge";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return createMetadata({
      title: "Article not found",
      description: "The requested blog article does not exist.",
      noIndex: true,
      path: `/blog/${slug}`,
    });
  }

  return createMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <TrackPageEvent
        event={{
          name: "blog_article_view",
          properties: {
            category: post.category,
            slug: post.slug,
            title: post.title,
          },
        }}
      />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.description,
          datePublished: post.publishedAt,
          articleSection: post.category,
          url: absoluteUrl(`/blog/${post.slug}`),
        }}
      />
      <PageHero
        hero={{
          eyebrow: `Blog article: ${post.category}`,
          title: post.title,
          description: post.description,
        }}
        actions={null}
        aside={
          <div className="space-y-4">
            <Badge>{post.readTime}</Badge>
            <p className="text-sm leading-6 text-muted">
              Published on {post.publishedAt}. This content layer is designed to
              support SEO and product education before a CMS is introduced.
            </p>
          </div>
        }
      />

      <SectionShell>
        <article className="space-y-6 rounded-[1.75rem] border border-border/80 bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
          {post.sections.map((section) => (
            <section className="space-y-4" key={section.title}>
              <h2 className="font-display text-3xl font-semibold tracking-tight">
                {section.title}
              </h2>
              <div className="space-y-4 text-base leading-7 text-muted">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {section.bullets ? (
                <ul className="list-disc space-y-2 pl-5 text-base leading-7 text-muted">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </article>
      </SectionShell>

      <SectionShell>
        <CtaBand
          description="Articles should create stronger intent, better trust, and cleaner internal linking toward product pages."
          title="A resource layer is useful only when it supports the real product story."
        />
      </SectionShell>
    </>
  );
}
