import Link from "next/link";

import { blogPosts } from "@/content/site";
import { createMetadata } from "@/features/seo/metadata";

import { PageHero } from "@/components/sections/page-hero";
import { SectionShell } from "@/components/sections/section-shell";
import { Badge } from "@/components/ui/badge";

export const metadata = createMetadata({
  title: "Blog",
  description:
    "Browse Reziphay resource articles on flexible booking logic, trust in service marketplaces, and SEO foundations for service discovery products.",
  path: "/blog",
});

export default function BlogIndexPage() {
  return (
    <>
      <PageHero
        hero={{
          eyebrow: "Resources",
          title: "A content foundation for search, trust, and product education.",
          description:
            "The blog is set up as a scalable resource surface for growth, SEO, and product positioning without adding a CMS before it is needed.",
        }}
        actions={null}
        aside={
          <div className="space-y-4 text-sm leading-6 text-muted">
            <p>Use resources for category education, marketplace trust, and SEO support.</p>
            <p>Keep articles aligned with the actual product boundaries.</p>
          </div>
        }
      />

      <SectionShell>
        <div className="grid gap-4 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Link
              className="rounded-[1.75rem] border border-border/80 bg-card p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:border-accent/30"
              href={`/blog/${post.slug}`}
              key={post.slug}
            >
              <Badge>{post.category}</Badge>
              <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight">
                {post.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">{post.description}</p>
              <div className="mt-6 text-xs uppercase tracking-[0.18em] text-accent-strong">
                {post.readTime} - {post.publishedAt}
              </div>
            </Link>
          ))}
        </div>
      </SectionShell>
    </>
  );
}

