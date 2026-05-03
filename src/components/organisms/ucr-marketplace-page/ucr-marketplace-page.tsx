"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Button } from "@/components/atoms";
import { Icon } from "@/components/icon";
import { ServiceCard } from "@/components/organisms/services-uso-page/services-uso-page";
import { useLocale } from "@/components/providers/locale-provider";
import { proxyMediaUrl } from "@/lib/media";
import type { MarketplaceFacet } from "@/lib/marketplace-api";
import type { Brand, Branch, BrandCategory, PublicUserProfile } from "@/types";
import type { Service, ServiceCategory } from "@/types/service";
import type { UserProfile } from "@/types/user_types";
import styles from "./ucr-marketplace-page.module.css";

type UcrMarketplacePageProps = {
  user: UserProfile;
  services: Service[];
  brands: Brand[];
  serviceCategories: MarketplaceFacet[];
  brandCategories: MarketplaceFacet[];
  ownersById: Record<string, PublicUserProfile>;
  activeServiceCategoryId?: string;
  activeBrandCategoryId?: string;
};

type ServiceWithContext = {
  service: Service;
  brand?: Brand;
  branch?: Branch;
  owner?: PublicUserProfile;
};

const PLACEHOLDER_IMAGE = "/banner1.jpg";
const PLACEHOLDER_LOGO = "/reziphay-logo.png";

function branchLookup(brands: Brand[]) {
  const map = new Map<string, { brand: Brand; branch: Branch }>();

  for (const brand of brands) {
    for (const branch of brand.branches ?? []) {
      map.set(branch.id, { brand, branch });
    }
  }

  return map;
}

function imageForBrand(brand: Brand) {
  return (
    proxyMediaUrl(brand.gallery?.[0]?.url) ??
    proxyMediaUrl(brand.logo_url) ??
    PLACEHOLDER_IMAGE
  );
}

function logoForBrand(brand: Brand) {
  return proxyMediaUrl(brand.logo_url) ?? PLACEHOLDER_LOGO;
}

function categoryLabel(
  category: Pick<BrandCategory | ServiceCategory, "key">,
  messages: ReturnType<typeof useLocale>["messages"],
) {
  return messages.categories[category.key as keyof typeof messages.categories] ?? category.key;
}

function CategoryRail({
  title,
  allLabel,
  categories,
  activeCategoryId,
  filterKey,
  secondaryFilterKey,
  secondaryFilterValue,
}: {
  title: string;
  allLabel: string;
  categories: MarketplaceFacet[];
  activeCategoryId: string;
  filterKey: "service_category_id" | "brand_category_id";
  secondaryFilterKey?: "service_category_id" | "brand_category_id";
  secondaryFilterValue?: string;
}) {
  const { messages } = useLocale();

  if (categories.length === 0) return null;

  function hrefFor(categoryId: string) {
    const params = new URLSearchParams();
    if (categoryId !== "all") params.set(filterKey, categoryId);
    if (secondaryFilterKey && secondaryFilterValue) {
      params.set(secondaryFilterKey, secondaryFilterValue);
    }

    const query = params.toString();
    return query ? `/home?${query}` : "/home";
  }

  return (
    <section className={styles.categorySection} aria-label={title}>
      <div className={styles.categoryHeader}>
        <h2>{title}</h2>
        <span>{categories.length}</span>
      </div>
      <div className={styles.categoryRail}>
        <Link
          href={hrefFor("all")}
          className={styles.categoryChip}
          data-active={activeCategoryId === "all"}
        >
          {allLabel}
        </Link>
        {categories.map((category) => (
          <Link
            href={hrefFor(category.id)}
            key={category.id}
            className={styles.categoryChip}
            data-active={activeCategoryId === category.id}
          >
            <span>{categoryLabel(category, messages)}</span>
            <small>{category.count}</small>
          </Link>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({
  title,
  actionHref,
  actionLabel,
}: {
  title: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className={styles.sectionHeader}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {actionHref && actionLabel ? (
        <Link className={styles.seeAll} href={actionHref}>
          {actionLabel}
          <Icon icon="arrow_forward" size={14} color="current" />
        </Link>
      ) : null}
    </div>
  );
}

function BrandCard({ brand }: { brand: Brand }) {
  const { messages } = useLocale();
  const t = messages.marketplace;

  return (
    <Link href={`/brands?id=${brand.id}`} className={styles.brandCard}>
      <div className={styles.brandCover}>
        <Image src={imageForBrand(brand)} alt={brand.name} fill className={styles.brandImage} sizes="220px" />
        {brand.categories[0] ? (
          <span className={styles.brandBadge}>
            {messages.categories[brand.categories[0].key as keyof typeof messages.categories] ?? brand.categories[0].key}
          </span>
        ) : null}
      </div>
      <div className={styles.brandBody}>
        <Image src={logoForBrand(brand)} alt="" width={34} height={34} className={styles.brandLogo} />
        <div>
          <h3>{brand.name}</h3>
          <p>{brand.rating ? `${brand.rating.toFixed(1)} · ${brand.rating_count}` : t.newBrand}</p>
        </div>
      </div>
    </Link>
  );
}

export function UcrMarketplacePage({
  user,
  services,
  brands,
  serviceCategories,
  brandCategories,
  ownersById,
  activeServiceCategoryId,
  activeBrandCategoryId,
}: UcrMarketplacePageProps) {
  const { messages } = useLocale();
  const t = messages.marketplace;
  const serviceCopy = messages.services;
  const router = useRouter();
  const selectedServiceCategoryId = activeServiceCategoryId ?? "all";
  const selectedBrandCategoryId = activeBrandCategoryId ?? "all";

  const branchMap = useMemo(() => branchLookup(brands), [brands]);
  const serviceItems = useMemo<ServiceWithContext[]>(
    () =>
      services.map((service) => {
        const branchContext = service.branch_id ? branchMap.get(service.branch_id) : undefined;
        return {
          service,
          brand: branchContext?.brand,
          branch: branchContext?.branch,
          owner: ownersById[service.owner_id],
        };
      }),
    [branchMap, ownersById, services],
  );

  const serviceCategoryOptions = serviceCategories;
  const brandCategoryOptions = brandCategories;

  const recentServices = serviceItems.slice(0, 10);
  const featuredServiceIds = new Set(recentServices.slice(0, 4).map((item) => item.service.id));
  const fastServices = serviceItems
    .filter(
      (item) =>
        item.service.duration !== null &&
        item.service.duration <= 60 &&
        !featuredServiceIds.has(item.service.id),
    )
    .slice(0, 10);
  const freeOrStarter = serviceItems
    .filter(
      (item) =>
        (item.service.price_type === "FREE" || item.service.price_type === "STARTING_FROM") &&
        !featuredServiceIds.has(item.service.id),
    )
    .slice(0, 10);
  const topBrands = [...brands]
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || b.rating_count - a.rating_count)
    .slice(0, 8);
  const heroService = serviceItems[0];
  const heroBrand = topBrands[0] ?? brands[0];
  const heroImageSrc = heroBrand
    ? imageForBrand(heroBrand)
    : heroService
      ? (proxyMediaUrl(heroService.service.images[0]?.url) ?? PLACEHOLDER_IMAGE)
      : PLACEHOLDER_IMAGE;
  const heroImageTitle = heroBrand?.name ?? heroService?.service.title ?? t.emptyTitle;
  const firstName = user.first_name?.trim();
  const currentServiceCategory = serviceCategoryOptions.find(
    (category) => category.id === activeServiceCategoryId,
  );
  const currentBrandCategory = brandCategoryOptions.find(
    (category) => category.id === activeBrandCategoryId,
  );

  function ownerAsCardUser(item: ServiceWithContext) {
    const owner = item.owner;
    return {
      id: owner?.id ?? item.service.owner_id,
      email: owner?.email ?? "",
      type: "uso" as const,
      first_name: owner?.first_name ?? "",
      last_name: owner?.last_name ?? "",
      email_verified: false,
      avatar_url: owner?.avatar_url ?? null,
    };
  }

  function FavoriteButton() {
    return (
      <Button
        variant="unstyled"
        type="button"
        className={styles.favoriteButton}
        aria-label={t.addFavorite}
        title={t.addFavorite}
      >
        <Icon icon="favorite" size={15} color="current" />
      </Button>
    );
  }

  return (
    <div className={styles.wrapper}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <h1 className={styles.heroTitle}>
            {firstName ? `${t.greeting}, ${firstName}` : t.greeting}
          </h1>
          <p className={styles.heroLead}>{t.lead}</p>
          <div className={styles.marketStats} aria-label={t.marketStats}>
            <span><strong>{services.length}</strong>{t.servicesStat}</span>
            <span><strong>{brands.length}</strong>{t.brandsStat}</span>
            <span><strong>{serviceCategoryOptions.length + brandCategoryOptions.length}</strong>{t.categoriesStat}</span>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <Image
            src={heroImageSrc}
            alt={heroImageTitle || t.heroImageAlt}
            fill
            className={styles.heroImage}
            sizes="(max-width: 900px) 100vw, 520px"
            priority
          />
          <div className={styles.heroOverlay}>
            <span>{heroBrand ? t.brandSpotlight : t.todayPick}</span>
            <strong>{heroImageTitle}</strong>
          </div>
        </div>
      </section>

      <CategoryRail
        title={t.serviceCategoriesTitle}
        allLabel={t.allServices}
        categories={serviceCategoryOptions}
        activeCategoryId={selectedServiceCategoryId}
        filterKey="service_category_id"
        secondaryFilterKey="brand_category_id"
        secondaryFilterValue={activeBrandCategoryId}
      />

      {recentServices.length > 0 ? (
        <section className={styles.section}>
          <SectionHeader
            title={
              currentServiceCategory
                ? categoryLabel(currentServiceCategory, messages)
                : t.featuredServices
            }
            actionHref="/brands"
            actionLabel={t.seeAll}
          />
          <div className={styles.serviceRail}>
            {recentServices.map((item) => (
              <ServiceCard
                key={item.service.id}
                service={item.service}
                copy={serviceCopy}
                brands={brands}
                user={ownerAsCardUser(item)}
                showStatus={false}
                favoriteSlot={<FavoriteButton />}
                onClick={() => router.push(`/services?id=${item.service.id}`)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <CategoryRail
        title={t.brandCategoriesTitle}
        allLabel={t.allBrands}
        categories={brandCategoryOptions}
        activeCategoryId={selectedBrandCategoryId}
        filterKey="brand_category_id"
        secondaryFilterKey="service_category_id"
        secondaryFilterValue={activeServiceCategoryId}
      />

      {topBrands.length > 0 ? (
        <section className={styles.section}>
          <SectionHeader
            title={
              currentBrandCategory
                ? categoryLabel(currentBrandCategory, messages)
                : t.brandSpotlight
            }
            actionHref="/brands"
            actionLabel={t.seeAll}
          />
          <div className={styles.brandRail}>
            {topBrands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        </section>
      ) : null}

      {recentServices.length === 0 && topBrands.length === 0 ? (
        <section className={styles.emptyState}>
          <div>
            <span className={styles.emptyEyebrow}>{t.emptyEyebrow}</span>
            <h2>{t.emptyTitle}</h2>
            <p>{t.emptyDescription}</p>
          </div>
          <Link className={styles.emptyAction} href="/brands">
            {t.exploreBrands}
            <Icon icon="arrow_forward" size={14} color="current" />
          </Link>
        </section>
      ) : null}

      {recentServices.length === 0 && topBrands.length > 0 ? (
        <section className={`${styles.emptyState} ${styles.emptyStateCompact}`}>
          <div>
            <span className={styles.emptyEyebrow}>{t.emptyEyebrow}</span>
            <h2>{t.emptyTitle}</h2>
            <p>{t.emptyDescription}</p>
          </div>
          <Link className={styles.emptyAction} href="/brands">
            {t.exploreBrands}
            <Icon icon="arrow_forward" size={14} color="current" />
          </Link>
        </section>
      ) : null}

      <section className={styles.bannerGrid}>
        <Link className={styles.banner} href="/brands">
          <span>{t.bannerOneEyebrow}</span>
          <strong>{t.bannerOneTitle}</strong>
        </Link>
        <Link className={`${styles.banner} ${styles.bannerAlt}`} href="/brands">
          <span>{t.bannerTwoEyebrow}</span>
          <strong>{t.bannerTwoTitle}</strong>
        </Link>
      </section>

      {fastServices.length >= 3 ? (
        <section className={styles.section}>
          <SectionHeader title={t.fastServices} />
          <div className={styles.compactGrid}>
            {fastServices.map((item) => (
              <ServiceCard
                key={item.service.id}
                service={item.service}
                copy={serviceCopy}
                brands={brands}
                user={ownerAsCardUser(item)}
                showStatus={false}
                favoriteSlot={<FavoriteButton />}
                onClick={() => router.push(`/services?id=${item.service.id}`)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {freeOrStarter.length >= 3 ? (
        <section className={styles.section}>
          <SectionHeader title={t.smartDeals} />
          <div className={styles.compactGrid}>
            {freeOrStarter.map((item) => (
              <ServiceCard
                key={item.service.id}
                service={item.service}
                copy={serviceCopy}
                brands={brands}
                user={ownerAsCardUser(item)}
                showStatus={false}
                favoriteSlot={<FavoriteButton />}
                onClick={() => router.push(`/services?id=${item.service.id}`)}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
