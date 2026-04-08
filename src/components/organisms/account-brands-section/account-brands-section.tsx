"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/button";
import { BrandCard } from "@/components/molecules/brand-card";
import { Icon } from "@/components/icon";
import { useLocale } from "@/components/providers/locale-provider";
import { proxyMediaUrl } from "@/lib/media";
import type { AccountUserProfile, Brand } from "@/types";
import styles from "./account-brands-section.module.css";

type AccountBrandsOwner = Pick<
  AccountUserProfile,
  "id" | "first_name" | "last_name" | "email" | "avatar_url" | "type"
>;

type AccountBrandsSectionProps = {
  brands: Brand[];
  owner: AccountBrandsOwner;
  title: string;
  description?: string;
  emptyTitle: string;
  emptyDescription: string;
  viewMoreHref?: string;
  maxItems?: number;
};

const PLACEHOLDER_IMAGE = "/banner1.jpg";
const PLACEHOLDER_LOGO = "/reziphay-logo.png";

function sortVisibleBrands(brands: Brand[]) {
  return [...brands].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "ACTIVE" ? -1 : 1;
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export function AccountBrandsSection({
  brands,
  owner,
  title,
  description,
  emptyTitle,
  emptyDescription,
  viewMoreHref,
  maxItems,
}: AccountBrandsSectionProps) {
  const router = useRouter();
  const { messages } = useLocale();
  const t = messages.brands;

  const visibleBrands = useMemo(
    () => sortVisibleBrands(brands.filter((brand) => brand.status === "ACTIVE" || brand.status === "CLOSED")),
    [brands],
  );

  const displayedBrands =
    typeof maxItems === "number" ? visibleBrands.slice(0, maxItems) : visibleBrands;
  const hasMore =
    typeof maxItems === "number" &&
    visibleBrands.length > maxItems &&
    Boolean(viewMoreHref);

  const ownerName = `${owner.first_name} ${owner.last_name}`.trim();
  const ownerAvatar = proxyMediaUrl(owner.avatar_url) ?? PLACEHOLDER_LOGO;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>{title}</h2>
          {description ? <p className={styles.description}>{description}</p> : null}
        </div>
        {hasMore && viewMoreHref ? (
          <Button variant="outline" onClick={() => router.push(viewMoreHref)}>
            {messages.profile.viewMoreBrands}
          </Button>
        ) : null}
      </div>

      {displayedBrands.length === 0 ? (
        <div className={styles.empty}>
          <Icon icon="sell" size={32} color="current" className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>{emptyTitle}</p>
          <p className={styles.emptyDescription}>{emptyDescription}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {displayedBrands.map((brand) => {
            const isClosed = brand.status === "CLOSED";
            const backgroundImage =
              proxyMediaUrl(brand.gallery?.[0]?.url ?? brand.logo_url) ?? PLACEHOLDER_IMAGE;
            const logoImage =
              proxyMediaUrl(brand.logo_url) ?? proxyMediaUrl(brand.gallery?.[0]?.url) ?? PLACEHOLDER_LOGO;

            return (
              <div
                key={brand.id}
                className={`${styles.cardWrap} ${isClosed ? styles.cardDisabled : ""}`}
                aria-disabled={isClosed ? "true" : undefined}
                title={isClosed ? t.statusClosed : undefined}
              >
                <BrandCard
                  logo={{ src: logoImage, alt: brand.name }}
                  backgroundImage={{ src: backgroundImage, alt: brand.name }}
                  title={brand.name}
                  description={brand.description ?? ""}
                  category={brand.categories[0]?.name}
                  badgeText={
                    brand.rating_count > 0
                      ? `${brand.rating_count} ${t.brandCardReviewsSuffix}`
                      : undefined
                  }
                  author={{
                    userId: owner.id,
                    name: ownerName,
                    avatar: ownerAvatar,
                    subtitle: owner.email,
                  }}
                  rating={brand.rating}
                  ratingCount={brand.rating_count}
                  onClick={!isClosed ? () => router.push(`/brands?id=${brand.id}`) : undefined}
                />
                {isClosed ? (
                  <span className={styles.disabledHint}>
                    <Icon icon="lock" size={14} color="current" />
                    {t.statusClosed}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
