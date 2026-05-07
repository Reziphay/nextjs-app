"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms";
import { Icon } from "@/components/icon";
import { ServiceCard } from "@/components/organisms/services-uso-page/services-uso-page";
import { useLocale } from "@/components/providers/locale-provider";
import { fetchPublicServicesPage, type PaginatedMeta } from "@/lib/services-api";
import { fetchUserProfileById } from "@/lib/users-api";
import type { Brand, PublicUserProfile } from "@/types";
import type { Service } from "@/types/service";
import styles from "./ucr-services-page.module.css";

type UcrServicesPageProps = {
  accessToken: string;
  initialServices: Service[];
  initialMeta: PaginatedMeta;
  brands: Brand[];
  ownersById: Record<string, PublicUserProfile>;
  activeServiceCategoryId?: string;
  serviceCategories: { id: string; key: string; count: number }[];
};

const PAGE_SIZE = 24;

function ownerAsCardUser(service: Service, ownersById: Record<string, PublicUserProfile>) {
  const owner = ownersById[service.owner_id];
  return {
    id: owner?.id ?? service.owner_id,
    email: owner?.email ?? "",
    type: "uso" as const,
    first_name: owner?.first_name ?? "",
    last_name: owner?.last_name ?? "",
    email_verified: false,
    avatar_url: owner?.avatar_url ?? null,
  };
}

export function UcrServicesPage({
  accessToken,
  initialServices,
  initialMeta,
  brands,
  ownersById: initialOwnersById,
  activeServiceCategoryId,
  serviceCategories,
}: UcrServicesPageProps) {
  const router = useRouter();
  const { messages } = useLocale();
  const [services, setServices] = useState(initialServices);
  const [ownersById, setOwnersById] = useState(initialOwnersById);
  const [page, setPage] = useState(initialMeta.page);
  const [hasMore, setHasMore] = useState(initialMeta.has_more);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const activeCategory = activeServiceCategoryId ?? "all";

  const categoryHref = (categoryId: string) => {
    if (categoryId === "all") return "/services";
    return `/services?category=${categoryId}`;
  };

  const ownerIds = useMemo(
    () => [...new Set(services.map((service) => service.owner_id).filter(Boolean))],
    [services],
  );

  useEffect(() => {
    const missing = ownerIds.filter((id) => !ownersById[id]);
    if (missing.length === 0) return;

    void Promise.all(
      missing.map(async (ownerId) => {
        const owner = await fetchUserProfileById(ownerId, accessToken);
        return owner ? ([ownerId, owner] as const) : null;
      }),
    ).then((entries) => {
      setOwnersById((current) => ({
        ...current,
        ...Object.fromEntries(entries.filter((entry): entry is readonly [string, PublicUserProfile] => entry !== null)),
      }));
    });
  }, [accessToken, ownerIds, ownersById]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (!first?.isIntersecting || loading) return;

      const nextPage = page + 1;
      setLoading(true);
      void fetchPublicServicesPage(
        {
          page: nextPage,
          limit: PAGE_SIZE,
          ...(activeServiceCategoryId && { service_category_id: activeServiceCategoryId }),
        },
        accessToken,
      )
        .then((result) => {
          setServices((current) => {
            const seen = new Set(current.map((service) => service.id));
            return [...current, ...result.services.filter((service) => !seen.has(service.id))];
          });
          setPage(result.meta.page);
          setHasMore(result.meta.has_more);
        })
        .finally(() => setLoading(false));
    }, { rootMargin: "480px" });

    observer.observe(node);
    return () => observer.disconnect();
  }, [accessToken, activeServiceCategoryId, hasMore, loading, page]);

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>{messages.marketplace.todayPick}</span>
          <h1>{messages.dashboard.services}</h1>
          <p>{messages.marketplace.lead}</p>
        </div>
      </header>

      {serviceCategories.length > 0 ? (
        <section className={styles.categorySection}>
          <Link
            href="/services"
            className={styles.categoryChip}
            data-active={activeCategory === "all"}
          >
            {messages.marketplace.allServices}
          </Link>
          {serviceCategories.map((category) => (
            <Link
              key={category.id}
              href={categoryHref(category.id)}
              className={styles.categoryChip}
              data-active={activeCategory === category.id}
            >
              <span>{messages.categories[category.key as keyof typeof messages.categories] ?? category.key}</span>
              <small>{category.count}</small>
            </Link>
          ))}
        </section>
      ) : null}

      <section className={styles.grid} aria-label={messages.dashboard.services}>
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            copy={messages.services}
            brands={brands}
            user={ownerAsCardUser(service, ownersById)}
            showStatus={false}
            onClick={() => router.push(`/services?id=${service.id}`)}
          />
        ))}
      </section>

      <div ref={sentinelRef} className={styles.sentinel}>
        {loading ? (
          <Button variant="unstyled" type="button" className={styles.loading}>
            <Icon icon="progress_activity" size={16} color="current" />
            {messages.auth.login.submitting}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
