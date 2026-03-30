'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { useT } from '@/lib/app/i18n/context';
import { discoveryService } from '@/lib/app/services/discovery.service';
import { ServiceCard } from '@/components/app/service-card';
import { RatingRow } from '@/components/app/rating-row';
import { SectionHeader } from '@/components/app/section-header';
import { AppEmptyState } from '@/components/app/empty-state';

export default function BrandDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useT();
  const router = useRouter();

  const { data: brand, isLoading } = useQuery({
    queryKey: ['brand', id],
    queryFn: () => discoveryService.fetchBrandDetail(id),
  });

  const { data: services } = useQuery({
    queryKey: ['brand-services', id],
    queryFn: () => discoveryService.fetchBrandServices(id),
    enabled: !!brand,
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-[var(--app-primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!brand) return <AppEmptyState icon="⚠️" title={t.commonError} />;

  const isVip = brand.visibilityLabels.some((l) => l.slug === 'vip');

  return (
    <div className="max-w-2xl mx-auto w-full px-4 pb-8">
      {/* Back */}
      <div className="sticky top-0 z-10 bg-[var(--app-bg)] py-3 flex items-center gap-3 border-b border-[var(--app-border)] mb-4">
        <button onClick={() => router.back()} className="text-[var(--app-ink-muted)] hover:text-[var(--app-primary)]">
          ← {t.commonBack}
        </button>
      </div>

      {/* Brand header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-20 h-20 rounded-2xl bg-[var(--app-primary-surface)] overflow-hidden shrink-0 flex items-center justify-center">
          {brand.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl">🏪</span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-[var(--app-ink)]">{brand.name}</h1>
            {isVip && (
              <span className="px-2 py-0.5 bg-amber-400 text-white text-xs font-bold rounded-full">VIP</span>
            )}
          </div>
          {brand.ratingStats && brand.ratingStats.reviewCount > 0 && (
            <RatingRow avgRating={brand.ratingStats.avgRating} reviewCount={brand.ratingStats.reviewCount} size="md" className="mt-1" />
          )}
          {brand.description && (
            <p className="text-sm text-[var(--app-ink-muted)] mt-2 line-clamp-3">{brand.description}</p>
          )}
        </div>
      </div>

      {/* Owner */}
      <button
        onClick={() => router.push(`/ucr/provider/${brand.owner.id}`)}
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--app-card)] border border-[var(--app-border)] mb-6 hover:border-[var(--app-primary-light)] transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-[var(--app-primary-surface)] flex items-center justify-center shrink-0">
          <span>👤</span>
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-[var(--app-ink)]">{brand.owner.fullName}</p>
          <p className="text-xs text-[var(--app-ink-faint)]">{t.brandDetailOwner}</p>
        </div>
      </button>

      {/* Contact / website */}
      {(brand.phone || brand.email || brand.website) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {brand.phone && (
            <a href={`tel:${brand.phone}`} className="text-xs px-3 py-1.5 rounded-full bg-[var(--app-card)] border border-[var(--app-border)] text-[var(--app-ink)] hover:border-[var(--app-primary)]">
              📞 {brand.phone}
            </a>
          )}
          {brand.website && (
            <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 rounded-full bg-[var(--app-card)] border border-[var(--app-border)] text-[var(--app-ink)] hover:border-[var(--app-primary)]">
              🌐 {t.brandDetailWebsite}
            </a>
          )}
        </div>
      )}

      {/* Services */}
      <SectionHeader title={t.brandDetailServices} />
      {services && services.items.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {services.items.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      ) : (
        <AppEmptyState icon="🛎️" title={t.exploreNoResults} />
      )}
    </div>
  );
}
