'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useT } from '@/lib/app/i18n/context';
import { discoveryService } from '@/lib/app/services/discovery.service';
import { ServiceCard } from '@/components/app/service-card';
import { BrandCard } from '@/components/app/brand-card';
import { AppEmptyState } from '@/components/app/empty-state';
import { cn } from '@/lib/utils/cn';

type Tab = 'services' | 'brands' | 'owners';

export default function FavoritesPage() {
  const t = useT();
  const [tab, setTab] = useState<Tab>('services');

  const { data: services, isLoading: loadSvcs } = useQuery({
    queryKey: ['favorite-services'],
    queryFn: () => discoveryService.fetchFavoriteServices(),
  });

  const { data: brands, isLoading: loadBrands } = useQuery({
    queryKey: ['favorite-brands'],
    queryFn: () => discoveryService.fetchFavoriteBrands(),
  });

  const isLoading = loadSvcs || loadBrands;

  const TABS: Array<{ key: Tab; label: string }> = [
    { key: 'services', label: t.favoritesServices },
    { key: 'brands', label: t.favoritesBrands },
  ];

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full">
      <div className="px-4 pt-6 pb-3">
        <h1 className="text-2xl font-bold text-[var(--app-ink)] mb-4">{t.favoritesTitle}</h1>
        <div className="flex gap-1 bg-[var(--app-card)] rounded-xl p-1">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                'flex-1 py-2 text-sm font-medium rounded-lg transition-colors',
                tab === key
                  ? 'bg-[var(--app-primary)] text-white'
                  : 'text-[var(--app-ink-muted)]',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-[var(--app-card)] animate-pulse" />
            ))}
          </div>
        ) : tab === 'services' ? (
          services && services.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {services.map((s) => <ServiceCard key={s.id} service={s} />)}
            </div>
          ) : (
            <AppEmptyState icon="🔖" title={t.favoritesEmpty} description={t.favoritesEmptyDesc} />
          )
        ) : (
          brands && brands.length > 0 ? (
            <div className="flex flex-col gap-3">
              {brands.map((b) => <BrandCard key={b.id} brand={b} />)}
            </div>
          ) : (
            <AppEmptyState icon="🔖" title={t.favoritesEmpty} description={t.favoritesEmptyDesc} />
          )
        )}
      </div>
    </div>
  );
}
