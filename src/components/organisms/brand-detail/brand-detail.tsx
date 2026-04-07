"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/icon";
import { proxyMediaUrl } from "@/lib/media";
import type { Brand, BrandStatus } from "@/types/brand";
import styles from "./brand-detail.module.css";

type BrandDetailProps = {
  brand: Brand;
  currentUserId?: string;
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
  PENDING: "Pending review",
  ACTIVE: "Active",
  REJECTED: "Rejected",
  CLOSED: "Closed",
};

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span
      className={styles.stars}
      aria-label={`Rating: ${rating} out of ${max}`}
      role="img"
    >
      {Array.from({ length: max }).map((_, i) => {
        const filled = rating - i;
        const isHalf = filled > 0 && filled < 1;
        const isFull = filled >= 1;
        const id = `detail-half-${i}`;

        return (
          <svg
            key={i}
            className={styles.star}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {isHalf && (
              <defs>
                <linearGradient id={id}>
                  <stop offset="50%" stopColor="var(--app-warning, #f59e0b)" />
                  <stop
                    offset="50%"
                    stopColor="var(--app-border-strong, #d1d5db)"
                  />
                </linearGradient>
              </defs>
            )}
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={
                isFull
                  ? "var(--app-warning, #f59e0b)"
                  : isHalf
                    ? `url(#${id})`
                    : "var(--app-border-strong, #d1d5db)"
              }
            />
          </svg>
        );
      })}
    </span>
  );
}

export function BrandDetail({ brand, currentUserId }: BrandDetailProps) {
  const router = useRouter();
  const isOwner = currentUserId && brand.owner_id === currentUserId;
  const categories = brand.categories ?? [];
  const gallery = brand.gallery ?? [];
  const branches = brand.branches ?? [];

  function handleEdit() {
    router.push(`/brands?progress=edit&id=${brand.id}`);
  }

  function handleBack() {
    router.back();
  }

  return (
    <div className={styles.wrapper}>
      {/* Back */}
      <div className={styles.backRow}>
        <Button variant="ghost" icon="arrow_back" onClick={handleBack}>
          Back
        </Button>
      </div>

      {/* Hero */}
      <div className={styles.hero}>
        {brand.logo_url ? (
          <div className={styles.logoWrapper}>
            <Image
              src={proxyMediaUrl(brand.logo_url)!}
              alt={brand.name}
              fill
              className={styles.logo}
              sizes="96px"
            />
          </div>
        ) : (
          <div className={styles.logoPlaceholder}>
            <Icon icon="sell" size={32} color="current" />
          </div>
        )}

        <div className={styles.heroInfo}>
          <div className={styles.heroTopRow}>
            <h1 className={styles.brandName}>{brand.name}</h1>
            <Badge variant={STATUS_BADGE_VARIANT[brand.status]}>
              {STATUS_LABEL[brand.status]}
            </Badge>
            {isOwner && (
              <div className={styles.heroActions}>
                <Button variant="outline" icon="edit" onClick={handleEdit}>
                  Edit
                </Button>
              </div>
            )}
          </div>

          {typeof brand.rating === "number" && (
            <div className={styles.ratingRow}>
              <span className={styles.ratingText}>{brand.rating.toFixed(1)} / 5</span>
              <StarRating rating={brand.rating} />
            </div>
          )}

          {categories.length > 0 && (
            <div className={styles.chips}>
              {categories.map((cat) => (
                <Badge key={cat.id} variant="secondary">
                  {cat.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Gallery */}
      {gallery.length > 0 && (
        <div className={styles.gallerySection}>
          <h2 className={styles.sectionTitle}>Gallery</h2>
          <div className={styles.galleryScroll}>
            {gallery
              .sort((a, b) => a.order - b.order)
              .map((item) => (
                <div key={item.id} className={styles.galleryItem}>
                  <Image
                    src={proxyMediaUrl(item.url)!}
                    alt={`${brand.name} gallery`}
                    fill
                    className={styles.galleryImage}
                    sizes="288px"
                  />
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Description */}
      {brand.description && (
        <div className={styles.descriptionSection}>
          <h2 className={styles.sectionTitle}>About</h2>
          <p className={styles.description}>{brand.description}</p>
        </div>
      )}

      {/* Branches */}
      <div className={styles.branchesSection}>
        <h2 className={styles.sectionTitle}>Branches ({branches.length})</h2>
        {branches.length === 0 ? (
          <div className={styles.emptyState}>No branches added yet.</div>
        ) : (
          <div className={styles.branchesList}>
            {branches.map((branch) => (
              <div key={branch.id} className={styles.branchCard}>
                <p className={styles.branchName}>{branch.name}</p>
                <p className={styles.branchAddress}>
                  {branch.address1}
                  {branch.address2 ? `, ${branch.address2}` : ""}
                </p>
                <div className={styles.branchMeta}>
                  {branch.is_24_7 ? (
                    <span className={styles.branchHours}>Open 24/7</span>
                  ) : (
                    branch.opening &&
                    branch.closing && (
                      <span className={styles.branchHours}>
                        {branch.opening} – {branch.closing}
                      </span>
                    )
                  )}
                  {branch.phone && (
                    <p className={styles.branchContact}>{branch.phone}</p>
                  )}
                  {branch.email && (
                    <p className={styles.branchContact}>{branch.email}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
