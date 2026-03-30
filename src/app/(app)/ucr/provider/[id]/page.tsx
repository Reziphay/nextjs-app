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

export default function ProviderProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useT();
  const router = useRouter();

  const { data: services, isLoading } = useQuery({
    queryKey: ['provider-services', id],
    queryFn: () => discoveryService.fetchProviderServices(id),
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-[var(--app-primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  // Use first service's owner data as proxy for provider info
  const owner = services?.items[0]?.owner;

  return (
    <div className="max-w-2xl mx-auto w-full px-4 pb-8">
      {/* Back */}
      <div className="sticky top-0 z-10 bg-[var(--app-bg)] py-3 flex items-center gap-3 border-b border-[var(--app-border)] mb-4">
        <button onClick={() => router.back()} className="text-[var(--app-ink-muted)] hover:text-[var(--app-primary)]">
          ← {t.commonBack}
        </button>
      </div>

      {owner && (
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-[var(--app-primary-surface)] overflow-hidden shrink-0 flex items-center justify-center">
            {owner.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={owner.avatarUrl} alt={owner.fullName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl">👤</span>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--app-ink)]">{owner.fullName}</h1>
            {owner.ratingStats && owner.ratingStats.reviewCount > 0 && (
              <RatingRow avgRating={owner.ratingStats.avgRating} reviewCount={owner.ratingStats.reviewCount} size="md" className="mt-1" />
            )}
          </div>
        </div>
      )}

      {/* Services */}
      <SectionHeader title={t.serviceDetailOwner + ' ' + t.navServices} />
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
