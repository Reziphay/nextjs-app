"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { BrandCard } from "@/components/molecules/brand-card";
import { Icon } from "@/components/icon";
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

const STATUS_LABEL: Record<BrandStatus, string> = {
  PENDING: "Pending",
  ACTIVE: "Active",
  REJECTED: "Rejected",
  CLOSED: "Closed",
};

const STATUS_ICON: Record<BrandStatus, string> = {
  PENDING: "schedule",
  ACTIVE: "check_circle",
  REJECTED: "cancel",
  CLOSED: "lock",
};

export function BrandsUsoPage({ brands, currentUserId }: BrandsUsoPageProps) {
  const router = useRouter();
  const { user } = useAppSelector(selectAuthSession);
  const authorName = user ? `${user.first_name} ${user.last_name}`.trim() : "";
  const authorAvatar = proxyMediaUrl(user?.avatar_url) ?? "/reziphay-logo.png";

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
        <h1 className={styles.title}>My Brands</h1>
        <Button
          variant="primary"
          icon="add"
          onClick={handleCreateBrand}
        >
          Create a brand
        </Button>
      </div>

      <div className={styles.grid}>
        {brands.length === 0 ? (
          <div className={styles.empty}>
            <Icon icon="sell" size={40} color="current" className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>No brands yet</p>
            <p className={styles.emptyDescription}>
              Create your first brand to start offering services and connect with customers.
            </p>
            <Button variant="primary" icon="add" onClick={handleCreateBrand}>
              Create a brand
            </Button>
          </div>
        ) : (
          brands.map((brand) => {
            const isOwner = brand.owner_id === currentUserId;
            const firstGalleryImage = proxyMediaUrl(brand.gallery?.[0]?.url ?? brand.logo_url);
            const placeholderImage = "/banner1.jpg";

            return (
              <div key={brand.id} className={styles.cardWrapper}>
                <Badge
                  className={styles.cardBadge}
                  variant={STATUS_BADGE_VARIANT[brand.status]}
                  icon={STATUS_ICON[brand.status]}
                >
                  {STATUS_LABEL[brand.status]}
                </Badge>

                {isOwner && (
                  <button
                    type="button"
                    className={styles.editButton}
                    aria-label={`Edit ${brand.name}`}
                    onClick={(e) => handleEditBrand(e, brand.id)}
                  >
                    <Icon icon="edit" size={14} color="current" />
                  </button>
                )}

                <BrandCard
                  image={{
                    src: firstGalleryImage ?? placeholderImage,
                    alt: brand.name,
                  }}
                  title={brand.name}
                  description={brand.description ?? ""}
                  author={{
                    name: authorName,
                    avatar: authorAvatar,
                  }}
                  rating={brand.rating ?? 0}
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
