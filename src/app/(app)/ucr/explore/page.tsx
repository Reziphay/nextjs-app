'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { useT } from '@/lib/app/i18n/context';
import { useCurrentUser } from '@/lib/app/stores/auth.store';
import { discoveryService } from '@/lib/app/services/discovery.service';
import { ServiceCard } from '@/components/app/service-card';
import { BrandCard } from '@/components/app/brand-card';
import { SectionHeader } from '@/components/app/section-header';
import { AppEmptyState } from '@/components/app/empty-state';

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
    <div className="flex flex-col px-4 pt-6 pb-8 max-w-2xl mx-auto w-full lg:max-w-3xl">
      {/* Greeting */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-[var(--app-ink)]">
          {user ? t.exploreGreeting(user.fullName) : t.appName}
        </h1>
      </div>

      {/* Search bar */}
      <button
        onClick={() => router.push('/ucr/search')}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--app-card)] border border-[var(--app-border)] text-[var(--app-ink-faint)] text-sm mb-6 hover:border-[var(--app-primary)] transition-colors"
      >
        <span>🔍</span>
        <span>{t.exploreSearch}</span>
      </button>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <div className="mb-6">
          <SectionHeader title={t.exploreCategories} />
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.slice(0, 10).map((cat) => (
              <button
                key={cat.id}
                onClick={() => router.push(`/ucr/search?categoryId=${cat.id}`)}
                className="shrink-0 px-4 py-1.5 rounded-full bg-[var(--app-card)] border border-[var(--app-border)] text-sm text-[var(--app-ink)] hover:bg-[var(--app-primary-soft)] hover:text-[var(--app-primary)] hover:border-[var(--app-primary)] transition-colors"
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popular Brands */}
      <div className="mb-6">
        <SectionHeader
          title={t.explorePopularBrands}
          seeAllHref="/ucr/search?tab=brands"
          seeAllLabel={t.exploreSeeAll}
        />
        {loadingBrands ? (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-[var(--app-card)] animate-pulse" />
            ))}
          </div>
        ) : brands && brands.items.length > 0 ? (
          <div className="flex flex-col gap-3">
            {brands.items.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        ) : (
          <AppEmptyState icon="🏪" title={t.exploreNoResults} />
        )}
      </div>

      {/* Services */}
      <div>
        <SectionHeader
          title={t.exploreFeatured}
          seeAllHref="/ucr/search?tab=services&showAll=true"
          seeAllLabel={t.exploreSeeAll}
        />
        {loadingServices ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-[var(--app-card)] animate-pulse" />
            ))}
          </div>
        ) : services && services.items.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {services.items.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <AppEmptyState icon="🛎️" title={t.exploreNoResults} />
        )}
      </div>
    </div>
  );
}
