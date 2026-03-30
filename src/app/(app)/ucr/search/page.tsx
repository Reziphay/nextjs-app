'use client';

import { useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { useT } from '@/lib/app/i18n/context';
import { discoveryService } from '@/lib/app/services/discovery.service';
import { ServiceCard } from '@/components/app/service-card';
import { BrandCard } from '@/components/app/brand-card';
import { AppEmptyState } from '@/components/app/empty-state';
import { cn } from '@/lib/utils/cn';
import type { SortBy } from '@/lib/app/models/discovery';

type Tab = 'services' | 'brands' | 'providers';

const SORT_OPTIONS: { value: SortBy; labelKey: keyof ReturnType<typeof useT> }[] = [
  { value: 'RELEVANCE', labelKey: 'searchSortRelevance' },
  { value: 'HIGHEST_RATED', labelKey: 'searchSortRating' },
  { value: 'NEAREST_FIRST', labelKey: 'searchSortNearest' },
  { value: 'PRICE_LOW_HIGH', labelKey: 'searchSortPriceLow' },
  { value: 'PRICE_HIGH_LOW', labelKey: 'searchSortPriceHigh' },
  { value: 'MOST_POPULAR', labelKey: 'searchSortPopular' },
];

export default function SearchPage() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab = (searchParams.get('tab') as Tab | null) ?? 'services';
  const [tab, setTab] = useState<Tab>(initialTab);
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [sortBy, setSortBy] = useState<SortBy>('RELEVANCE');
  const [showFilters, setShowFilters] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Simple debounce
  const handleQueryChange = useCallback((v: string) => {
    setQuery(v);
    const timer = setTimeout(() => setDebouncedQuery(v), 400);
    return () => clearTimeout(timer);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery, sortBy],
    queryFn: () =>
      discoveryService.search({
        query: debouncedQuery,
        sortBy,
        limit: 20,
      }),
    enabled: true,
  });

  const TABS: Array<{ key: Tab; label: string }> = [
    { key: 'services', label: t.searchServices },
    { key: 'brands', label: t.searchBrands },
    { key: 'providers', label: t.searchProviders },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--app-bg)] px-4 pt-4 pb-3 border-b border-[var(--app-border)]">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => router.back()}
            className="text-[var(--app-ink-muted)] hover:text-[var(--app-primary)] p-1"
          >
            ←
          </button>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="flex-1 px-3 py-2 rounded-xl bg-[var(--app-card)] border border-[var(--app-border)] text-[var(--app-ink)] placeholder:text-[var(--app-ink-faint)] focus:outline-none focus:border-[var(--app-primary)] text-sm"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'px-3 py-2 rounded-xl border text-sm font-medium transition-colors',
              showFilters
                ? 'bg-[var(--app-primary-soft)] border-[var(--app-primary)] text-[var(--app-primary)]'
                : 'border-[var(--app-border)] text-[var(--app-ink-muted)]',
            )}
          >
            {t.searchFilters}
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-3">
            <p className="text-xs text-[var(--app-ink-muted)] mb-2">{t.searchSortBy}</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {SORT_OPTIONS.map(({ value, labelKey }) => (
                <button
                  key={value}
                  onClick={() => setSortBy(value)}
                  className={cn(
                    'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                    sortBy === value
                      ? 'bg-[var(--app-primary)] text-white border-[var(--app-primary)]'
                      : 'border-[var(--app-border)] text-[var(--app-ink-muted)]',
                  )}
                >
                  {t[labelKey] as string}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                'flex-1 py-2 text-sm font-medium rounded-lg transition-colors',
                tab === key
                  ? 'bg-[var(--app-primary-soft)] text-[var(--app-primary)]'
                  : 'text-[var(--app-ink-muted)]',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-[var(--app-card)] animate-pulse" />
            ))}
          </div>
        ) : tab === 'services' ? (
          data?.services?.items?.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {data.services.items.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          ) : (
            <AppEmptyState
              icon="🔍"
              title={t.searchNoResults}
              description={t.searchTryDifferent}
            />
          )
        ) : tab === 'brands' ? (
          data?.brands?.items?.length ? (
            <div className="flex flex-col gap-3">
              {data.brands.items.map((b) => (
                <BrandCard key={b.id} brand={b} />
              ))}
            </div>
          ) : (
            <AppEmptyState icon="🏪" title={t.searchNoResults} description={t.searchTryDifferent} />
          )
        ) : (
          // Providers tab
          data?.providers?.items?.length ? (
            <div className="flex flex-col gap-3">
              {data.providers.items.map((p) => (
                <button
                  key={p.id}
                  onClick={() => router.push(`/ucr/provider/${p.id}`)}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--app-card)] border border-[var(--app-border)] hover:border-[var(--app-primary-light)] transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-[var(--app-primary-surface)] flex items-center justify-center shrink-0">
                    <span className="text-lg">👤</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-[var(--app-ink)]">{p.fullName}</p>
                    {p.ratingStats && (
                      <p className="text-xs text-[var(--app-ink-faint)]">
                        ★ {p.ratingStats.avgRating.toFixed(1)} · {p.servicesCount} xidmət
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <AppEmptyState icon="👤" title={t.searchNoResults} description={t.searchTryDifferent} />
          )
        )}
      </div>
    </div>
  );
}
