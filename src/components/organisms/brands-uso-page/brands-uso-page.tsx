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
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "secondary",
  ACTIVE: "default",
  REJECTED: "destructive",
  CLOSED: "outline",
};

export function BrandsUsoPage({ brands, currentUserId }: BrandsUsoPageProps) {
  const router = useRouter();
  const { messages } = useLocale();
  const t = messages.brands;
  const { user } = useAppSelector(selectAuthSession);
  const authorName = user ? `${user.first_name} ${user.last_name}`.trim() : "";
  const authorAvatar = proxyMediaUrl(user?.avatar_url) ?? "/reziphay-logo.png";
  const authorSubtitle = user?.email ?? "";

  const STATUS_LABEL: Record<BrandStatus, string> = {
    PENDING: t.statusPending,
    ACTIVE: t.statusActive,
    REJECTED: t.statusRejected,
    CLOSED: t.statusClosed,
  };

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
            const isOwner = brand.owner_id === currentUserId;
            const firstGalleryImage = proxyMediaUrl(brand.gallery?.[0]?.url ?? brand.logo_url);
            const placeholderImage = "/banner1.jpg";

            return (
              <div key={brand.id} className={styles.cardWrapper}>
                {isOwner && (
                  <button
                    type="button"
                    className={styles.editButton}
                    aria-label={`${t.editBrand}: ${brand.name}`}
                    onClick={(e) => handleEditBrand(e, brand.id)}
                  >
                    <Icon icon="edit" size={14} color="current" />
                  </button>
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
                  category={brand.categories[0]?.name}
                  badgeText={isOwner ? STATUS_LABEL[brand.status] : undefined}
                  badgeVariant={isOwner ? STATUS_BADGE_VARIANT[brand.status] : undefined}
                  badgePlacement={isOwner ? "below-title" : undefined}
                  author={{
                    name: authorName,
                    avatar: authorAvatar,
                    subtitle: authorSubtitle,
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
