"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/button";
import { BrandCard } from "@/components/molecules/brand-card";
import { Icon } from "@/components/icon";
import { useLocale } from "@/components/providers/locale-provider";
import { useAppSelector } from "@/store/hooks";
import { selectAuthSession } from "@/store/auth";
import { proxyMediaUrl } from "@/lib/media";
import type { Brand, BrandStatus } from "@/types/brand";
import styles from "./brands-uso-page.module.css";

type BrandsUsoPageProps = {
  brands: Brand[];
  currentUserId: string;
};

const STATUS_BADGE_VARIANT: Record<
  BrandStatus,
  "success" | "warm" | "error" | "muted"
> = {
  PENDING: "warm",
  ACTIVE: "success",
  REJECTED: "error",
  CLOSED: "muted",
};

export function BrandsUsoPage({ brands, currentUserId }: BrandsUsoPageProps) {
  const router = useRouter();
  const { messages } = useLocale();
  const t = messages.brands;
  const { user } = useAppSelector(selectAuthSession);

  const STATUS_LABEL: Record<BrandStatus, string> = {
    PENDING: t.statusPending,
    ACTIVE: t.statusActive,
    REJECTED: t.statusRejected,
    CLOSED: t.statusClosed,
  };

  const memberBadgeLabel = t.memberBadge ?? null;

  function handleCreateBrand() {
    router.push("/brands?progress=create");
  }

  function handleViewBrand(id: string) {
    router.push(`/brands?id=${id}`);
  }

  function handleEditBrand(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    router.push(`/brands?progress=edit&id=${id}`);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>{t.myBrands}</h1>
        <Button
          variant="primary"
          icon="add"
          onClick={handleCreateBrand}
        >
          {t.createBrand}
        </Button>
      </div>

      <div className={styles.grid}>
        {brands.length === 0 ? (
          <div className={styles.empty}>
            <Icon icon="sell" size={40} color="current" className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>{t.noBrandsTitle}</p>
            <p className={styles.emptyDescription}>{t.noBrandsDescription}</p>
            <Button variant="primary" icon="add" onClick={handleCreateBrand}>
              {t.createBrand}
            </Button>
          </div>
        ) : (
          brands.map((brand) => {
            const isOwner =
              brand.viewer_role === "OWNER" || brand.owner_id === currentUserId;
            const isMember = brand.viewer_role === "MEMBER";
            const firstGalleryImage = proxyMediaUrl(brand.gallery?.[0]?.url ?? brand.logo_url);
            const placeholderImage = "/banner1.jpg";
            const owner = brand.owner;
            const ownerName = owner
              ? `${owner.first_name} ${owner.last_name}`.trim() || owner.email
              : user && brand.owner_id === user.id
                ? `${user.first_name} ${user.last_name}`.trim() || user.email
                : "";
            const ownerAvatar = owner
              ? proxyMediaUrl(owner.avatar_url) ?? "/reziphay-logo.png"
              : user && brand.owner_id === user.id
                ? proxyMediaUrl(user.avatar_url) ?? "/reziphay-logo.png"
                : "/reziphay-logo.png";
            const ownerSubtitle = owner?.email ?? (user && brand.owner_id === user.id ? user.email : "");

            const badgeText = isOwner
              ? STATUS_LABEL[brand.status]
              : isMember
                ? memberBadgeLabel
                : undefined;
            const badgeVariant = isOwner
              ? STATUS_BADGE_VARIANT[brand.status]
              : isMember
                ? "secondary"
                : undefined;
            const badgePlacement = badgeText ? "below-title" : undefined;

            return (
              <div key={brand.id} className={styles.cardWrapper}>
                {isOwner && (
                  <Button
                    variant="unstyled"
                    type="button"
                    className={styles.editButton}
                    aria-label={`${t.editBrand}: ${brand.name}`}
                    onClick={(e) => handleEditBrand(e, brand.id)}
                  >
                    <Icon icon="edit" size={14} color="current" />
                  </Button>
                )}

                <BrandCard
                  logo={{
                    src: proxyMediaUrl(brand.logo_url) ?? firstGalleryImage ?? placeholderImage,
                    alt: brand.name,
                  }}
                  backgroundImage={{
                    src: firstGalleryImage ?? proxyMediaUrl(brand.logo_url) ?? placeholderImage,
                    alt: brand.name,
                  }}
                  title={brand.name}
                  description={brand.description ?? ""}
                  category={brand.categories[0] ? (messages.categories[brand.categories[0].key as keyof typeof messages.categories] ?? brand.categories[0].key) : undefined}
                  badgeText={badgeText}
                  badgeVariant={badgeVariant}
                  badgePlacement={badgePlacement}
                  author={{
                    userId: owner?.id ?? brand.owner_id,
                    name: ownerName,
                    avatar: ownerAvatar,
                    subtitle: ownerSubtitle,
                  }}
                  rating={brand.rating}
                  ratingCount={brand.rating_count}
                  onClick={() => handleViewBrand(brand.id)}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
