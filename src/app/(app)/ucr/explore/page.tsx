'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { BrandCard } from '@/components/app/brand-card';
import { AppEmptyState } from '@/components/app/empty-state';
import { SectionHeader } from '@/components/app/section-header';
import { ServiceCard } from '@/components/app/service-card';
import { discoveryService } from '@/lib/app/services/discovery.service';
import { useT } from '@/lib/app/i18n/context';
import { useCurrentUser } from '@/lib/app/stores/auth.store';

export default function ExplorePage() {
  const t = useT();
  const router = useRouter();
  const user = useCurrentUser();

  const { data: services, isLoading: loadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: () => discoveryService.fetchServices({ limit: 8 }),
  });

  const { data: brands, isLoading: loadingBrands } = useQuery({
    queryKey: ['brands'],
    queryFn: () => discoveryService.fetchBrands({ limit: 6 }),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => discoveryService.fetchCategories(),
  });

  return (
    <div className="min-h-full bg-[var(--app-bg)]">
      <div className="mx-auto flex w-full max-w-3xl flex-col pb-8">
        <div className="border-b border-[var(--app-divider)] bg-[var(--app-base-bg)] px-4 pb-5 pt-6 sm:rounded-b-[32px] sm:px-6">
          <h1 className="text-[28px] font-extrabold tracking-[-0.04em] text-[var(--app-ink)]">
            {user ? t.exploreGreeting(user.fullName) : t.appName}
          </h1>
          <p className="mt-1 text-sm text-[var(--app-ink-muted)]">{t.appTagline}</p>

          <button
            onClick={() => router.push('/ucr/search')}
            className="mt-5 flex h-12 w-full items-center gap-3 rounded-[14px] border border-[var(--app-divider)] bg-[var(--app-bg)] px-4 text-sm text-[var(--app-ink-muted)] transition-colors hover:border-[var(--app-primary)]"
          >
            <span>🔍</span>
            <span>{t.exploreSearch}</span>
          </button>
        </div>

        <div className="space-y-7 px-4 pt-6 sm:px-6">
          {categories && categories.length > 0 ? (
            <div>
              <SectionHeader title={t.exploreCategories} />
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide">
                {categories.slice(0, 10).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => router.push(`/ucr/search?categoryId=${cat.id}`)}
                    className="shrink-0 rounded-full border border-[var(--app-border)] bg-[var(--app-card)] px-4 py-2 text-sm text-[var(--app-ink)] transition-colors hover:border-[var(--app-primary)] hover:bg-[var(--app-primary-soft)] hover:text-[var(--app-primary)]"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <SectionHeader
              title={t.explorePopularBrands}
              seeAllHref="/ucr/search?tab=brands"
              seeAllLabel={t.exploreSeeAll}
            />
            {loadingBrands ? (
              <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-40 w-[148px] shrink-0 rounded-[20px] bg-[var(--app-card)] animate-pulse"
                  />
                ))}
              </div>
            ) : brands && brands.items.length > 0 ? (
              <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
                {brands.items.map((brand) => (
                  <BrandCard key={brand.id} brand={brand} variant="compact" />
                ))}
              </div>
            ) : (
              <AppEmptyState icon="🏪" title={t.exploreNoResults} />
            )}
          </div>

          <div>
            <SectionHeader
              title={t.exploreFeatured}
              seeAllHref="/ucr/search?tab=services&showAll=true"
              seeAllLabel={t.exploreSeeAll}
            />
            {loadingServices ? (
              <div className="flex flex-col gap-3">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-28 rounded-[20px] bg-[var(--app-card)] animate-pulse"
                  />
                ))}
              </div>
            ) : services && services.items.length > 0 ? (
              <div className="flex flex-col gap-3">
                {services.items.map((service) => (
                  <ServiceCard key={service.id} service={service} variant="list" />
                ))}
              </div>
            ) : (
              <AppEmptyState icon="🛎️" title={t.exploreNoResults} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
