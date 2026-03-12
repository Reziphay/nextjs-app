import Link from "next/link";
import { notFound } from "next/navigation";

import { featuredCategories, featuredCities, getCityBySlug } from "@/content/site";
import { TrackPageEvent } from "@/features/analytics/track-page-event";
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
  return featuredCities.map((city) => ({
    slug: city.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const city = getCityBySlug(slug);

  if (!city) {
    return createMetadata({
      title: "City not found",
      description: "The requested city page does not exist.",
      noIndex: true,
      path: `/cities/${slug}`,
    });
  }

  return createMetadata({
    title: `${city.name} service discovery`,
    description: city.description,
    keywords: city.keywords,
    path: `/cities/${city.slug}`,
  });
}

export default async function CityPage({ params }: PageProps) {
  const { slug } = await params;
  const city = getCityBySlug(slug);

  if (!city) {
    notFound();
  }

  return (
    <>
      <TrackPageEvent
        event={{
          name: "city_page_view",
          properties: {
            name: city.name,
            slug: city.slug,
          },
        }}
      />
      <PageHero
        hero={{
          eyebrow: `City page: ${city.name}`,
          title: city.title,
          description: city.description,
        }}
        actions={null}
        aside={
          <div className="space-y-4">
            <Badge>Local growth layer</Badge>
            <p className="text-sm leading-6 text-muted">{city.intro}</p>
          </div>
        }
      />

      <SectionShell>
        <SectionHeading
          eyebrow="City signals"
          title={`Why ${city.name} works as an SEO and acquisition hub`}
          description="City pages are designed to collect local demand without misleading users about where bookings happen."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {city.signals.map((signal) => (
            <div
              className="rounded-[1.5rem] border border-border/80 bg-card p-5 shadow-[var(--shadow-card)]"
              key={signal}
            >
              <p className="text-sm leading-6 text-muted">{signal}</p>
            </div>
          ))}
        </div>
      </SectionShell>

      <SectionShell tone="surface">
        <div className="rounded-[2rem] px-6 py-8 sm:px-8 lg:px-10">
          <SectionHeading
            eyebrow="Relevant categories"
            title="Pair city pages with category pages for stronger search coverage."
            description="This route structure is intentionally simple so future SEO expansion stays predictable."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {featuredCategories.map((category) => (
              <Link
                className="rounded-[1.5rem] border border-border/80 bg-white p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:border-accent/30"
                href={`/categories/${category.slug}`}
                key={category.slug}
              >
                <Badge>{category.name}</Badge>
                <h3 className="mt-4 text-lg font-semibold">{category.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell>
        <CtaBand
          description="Use city pages to support localized discovery, launch readiness, and provider demand capture."
          title={`Turn ${city.name} search intent into a clear path toward the app and provider forms.`}
        />
      </SectionShell>
    </>
  );
}
