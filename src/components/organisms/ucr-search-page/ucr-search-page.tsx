"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/icon";
import { MarketplaceSearchBox } from "@/components/molecules/marketplace-search-box/marketplace-search-box";
import { useLocale } from "@/components/providers/locale-provider";
import { proxyMediaUrl } from "@/lib/media";
import { searchMarketplace, type MarketplaceSearchItem, type MarketplaceSearchResults } from "@/lib/search-api";
import type { MarketplaceFacet } from "@/lib/marketplace-api";
import styles from "./ucr-search-page.module.css";

type UcrSearchPageProps = {
  accessToken: string;
  initialQuery: string;
  facets: {
    service_categories: MarketplaceFacet[];
    brand_categories: MarketplaceFacet[];
  };
};

const EMPTY_RESULTS: MarketplaceSearchResults["results"] = {
  brands: [],
  branches: [],
  services: [],
  users: [],
  addresses: [],
};

function sectionLabel(key: keyof MarketplaceSearchResults["results"]) {
  const labels = {
    brands: "Brendlər",
    branches: "Filiallar",
    services: "Servislər",
    users: "USO",
    addresses: "Ünvanlar",
  };
  return labels[key];
}

function typeForSection(key: keyof MarketplaceSearchResults["results"]) {
  if (key === "brands") return "brand";
  if (key === "branches") return "branch";
  if (key === "services") return "service";
  if (key === "users") return "uso";
  return "address";
}

function ResultCard({ item }: { item: MarketplaceSearchItem }) {
  const img = proxyMediaUrl(item.image_url);

  return (
    <Link href={item.href} className={styles.resultCard}>
      <span className={styles.resultMedia}>
        {item.type === "address" ? (
          <Icon icon="location_on" size={18} color="current" />
        ) : img ? (
          <Image src={img} alt="" fill sizes="44px" className={styles.resultImage} />
        ) : (
          <Icon icon={item.type === "service" ? "room_service" : item.type === "brand" ? "store" : "person"} size={17} color="current" />
        )}
      </span>
      <span className={styles.resultText}>
        <strong>{item.title}</strong>
        <small>{item.subtitle}</small>
      </span>
      {typeof item.rating === "number" && item.rating > 0 ? (
        <span className={styles.rating}>
          <Icon icon="star" size={12} color="current" fill />
          {item.rating.toFixed(1)}
        </span>
      ) : null}
    </Link>
  );
}

export function UcrSearchPage({ accessToken, initialQuery, facets }: UcrSearchPageProps) {
  const { messages } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query") ?? searchParams.get("queary") ?? initialQuery;
  const [results, setResults] = useState<MarketplaceSearchResults["results"]>(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);
  const activeType = searchParams.get("type") ?? "all";
  const activeCategory = searchParams.get("category") ?? "";
  const activeSort = searchParams.get("sort") ?? "relevance";

  useEffect(() => {
    if (query.trim().length < 2) {
      return;
    }

    let cancelled = false;
    void Promise.resolve()
      .then(() => {
        if (!cancelled) setLoading(true);
        return searchMarketplace(query, accessToken, {
          type: activeType,
          category: activeCategory,
          sort: activeSort,
          limit: 24,
        });
      })
      .then((data) => {
        if (!cancelled) setResults(data.results);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, activeCategory, activeSort, activeType, query]);

  const total = useMemo(
    () => Object.values(query.trim().length < 2 ? EMPTY_RESULTS : results).reduce((sum, items) => sum + items.length, 0),
    [query, results],
  );
  const visibleResults = query.trim().length < 2 ? EMPTY_RESULTS : results;

  function patchParams(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("query", query);
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push(`/search?${params.toString()}`);
  }

  const categories = [...facets.service_categories, ...facets.brand_categories];

  return (
    <div className={styles.wrapper}>
      <header className={styles.hero}>
        <h1>{messages.dashboard.search}</h1>
        <MarketplaceSearchBox
          accessToken={accessToken}
          placeholder={messages.marketplace.searchPlaceholder}
          variant="page"
        />
      </header>

      <div className={styles.filters}>
        {["all", "service", "brand", "branch", "uso", "address"].map((type) => (
          <button
            key={type}
            type="button"
            data-active={activeType === type}
            onClick={() => patchParams({ type: type === "all" ? null : type })}
          >
            {type === "all" ? messages.marketplace.allCategories : type}
          </button>
        ))}
        <button
          type="button"
          data-active={activeSort === "rating_desc"}
          onClick={() => patchParams({ sort: activeSort === "rating_desc" ? null : "rating_desc" })}
        >
          <Icon icon="star" size={13} color="current" />
          {messages.marketplace.topRated}
        </button>
      </div>

      {categories.length > 0 ? (
        <div className={styles.categoryRail}>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              data-active={activeCategory === category.id}
              onClick={() => patchParams({ category: activeCategory === category.id ? null : category.id })}
            >
              {messages.categories[category.key as keyof typeof messages.categories] ?? category.key}
              <span>{category.count}</span>
            </button>
          ))}
        </div>
      ) : null}

      <div className={styles.summary}>
        {loading ? "Axtarılır..." : query.trim().length >= 2 ? `${total} nəticə` : "Axtarmaq üçün yazmağa başla"}
      </div>

      {(["brands", "branches", "services", "users", "addresses"] as const).map((section) => {
        const items = visibleResults[section];
        if (items.length === 0) return null;
        return (
          <section key={section} className={styles.section}>
            <h2>{sectionLabel(section)}</h2>
            <div className={styles.grid}>
              {items.map((item) => (
                <ResultCard key={`${item.type}-${item.id}`} item={{ ...item, type: typeForSection(section) as MarketplaceSearchItem["type"] }} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
