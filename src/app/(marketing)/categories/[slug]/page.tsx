import { notFound } from "next/navigation";

import {
  featuredCities,
  featuredCategories,
  getCategoryBySlug,
} from "@/content/site";
import { createMetadata } from "@/features/seo/metadata";

import { CtaBand } from "@/components/sections/cta-band";
import { PageHero } from "@/components/sections/page-hero";
import { SectionHeading } from "@/components/sections/section-heading";
import { SectionShell } from "@/components/sections/section-shell";
import { Badge } from "@/components/ui/badge";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return featuredCategories.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return createMetadata({
      title: "Category not found",
      description: "The requested category page does not exist.",
      noIndex: true,
      path: `/categories/${slug}`,
    });
  }

  return createMetadata({
    title: `${category.name} on Reziphay`,
    description: category.description,
    keywords: category.keywords,
    path: `/categories/${category.slug}`,
  });
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  return (
    <>
      <PageHero
        hero={{
          eyebrow: `Category page: ${category.name}`,
          title: category.title,
          description: category.description,
        }}
        actions={null}
        aside={
          <div className="space-y-4">
            <Badge>Why this category page matters</Badge>
            <p className="text-sm leading-6 text-muted">{category.intro}</p>
          </div>
        }
      />

      <SectionShell>
        <SectionHeading
          eyebrow="Category benefits"
          title={`How ${category.name.toLowerCase()} can use the platform`}
          description="Use category landing pages to combine product education, discovery framing, and provider acquisition."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {category.benefits.map((benefit) => (
            <div
              className="rounded-[1.5rem] border border-border/80 bg-card p-5 shadow-[var(--shadow-card)]"
              key={benefit}
            >
              <p className="text-sm leading-6 text-muted">{benefit}</p>
            </div>
          ))}
        </div>
      </SectionShell>

      <SectionShell tone="surface">
        <div className="rounded-[2rem] px-6 py-8 sm:px-8 lg:px-10">
          <SectionHeading
            eyebrow="City expansion"
            title="Connect category pages to city-based demand capture."
            description="The website architecture supports both category and city dimensions so growth content can scale without rework."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            {featuredCities.map((city) => (
              <a
                className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium transition hover:border-accent hover:text-accent"
                href={`/cities/${city.slug}`}
                key={city.slug}
              >
                {city.name}
              </a>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell>
        <CtaBand
          description="Each category page should guide both customers and providers toward the right next action."
          title={`Use ${category.name.toLowerCase()} pages as SEO-friendly entry points into the mobile product.`}
        />
      </SectionShell>
    </>
  );
}

