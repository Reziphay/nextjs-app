"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/icon";
import { useLocale } from "@/components/providers/locale-provider";
import { submitBrandRating } from "@/lib/brands-api";
import { proxyMediaUrl } from "@/lib/media";
import { selectAuthSession } from "@/store/auth";
import { useAppSelector } from "@/store/hooks";
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

function RatingButtonRow({
  currentRating,
  isLoading,
  onSelect,
}: {
  currentRating: number | null;
  isLoading: boolean;
  onSelect: (value: number) => void;
}) {
  return (
    <div className={styles.ratingButtons}>
      {Array.from({ length: 5 }, (_, index) => {
        const value = index + 1;
        const isActive = value <= (currentRating ?? 0);

        return (
          <button
            key={value}
            type="button"
            className={`${styles.ratingButton} ${isActive ? styles.ratingButtonActive : ""}`}
            onClick={() => onSelect(value)}
            disabled={isLoading}
            aria-label={`Rate ${value} out of 5`}
          >
            <svg
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className={styles.ratingButtonIcon}
            >
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill={isActive ? "var(--app-warning, #f59e0b)" : "var(--app-border-strong, #d1d5db)"}
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

export function BrandDetail({ brand, currentUserId }: BrandDetailProps) {
  const router = useRouter();
  const { messages } = useLocale();
  const t = messages.brands;
  const session = useAppSelector(selectAuthSession);
  const [brandState, setBrandState] = useState(brand);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingFeedback, setRatingFeedback] = useState<string | null>(null);

  const isOwner = currentUserId && brandState.owner_id === currentUserId;
  const categories = brandState.categories ?? [];
  const gallery = brandState.gallery ?? [];
  const branches = brandState.branches ?? [];
  const canRate =
    session.user?.type === "ucr" &&
    brandState.status === "ACTIVE" &&
    !isOwner;

  const STATUS_LABEL: Record<BrandStatus, string> = {
    PENDING: t.statusPending,
    ACTIVE: t.statusActive,
    REJECTED: t.statusRejected,
    CLOSED: t.statusClosed,
  };

  function handleEdit() {
    router.push(`/brands?progress=edit&id=${brandState.id}`);
  }

  function handleBack() {
    router.back();
  }

  async function handleRate(value: number) {
    const accessToken = session.accessToken;
    if (!accessToken) {
      setRatingFeedback(t.loginRequired);
      return;
    }

    setRatingLoading(true);
    setRatingFeedback(null);

    try {
      const updatedBrand = await submitBrandRating(brandState.id, value, accessToken);
      setBrandState((prev) => ({
        ...prev,
        rating: updatedBrand.rating,
        rating_count: updatedBrand.rating_count,
        my_rating: updatedBrand.my_rating,
      }));
      setRatingFeedback(t.ratingSavedDescription);
    } catch (error) {
      const apiMessage = isAxiosError(error)
        ? (error.response?.data?.message as string | undefined)
        : undefined;

      if (apiMessage === "errors.forbidden") {
        setRatingFeedback(t.forbiddenDescription);
      } else if (apiMessage === "brand.not_found") {
        setRatingFeedback(t.notFoundDescription);
      } else {
        setRatingFeedback(t.errorGeneric);
      }
    } finally {
      setRatingLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.backRow}>
        <Button variant="ghost" icon="arrow_back" onClick={handleBack}>
          {t.back}
        </Button>
      </div>

      <div className={styles.hero}>
        {brandState.logo_url ? (
          <div className={styles.logoWrapper}>
            <Image
              src={proxyMediaUrl(brandState.logo_url)!}
              alt={brandState.name}
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
            <h1 className={styles.brandName}>{brandState.name}</h1>
            <Badge variant={STATUS_BADGE_VARIANT[brandState.status]}>
              {STATUS_LABEL[brandState.status]}
            </Badge>
            {isOwner && (
              <div className={styles.heroActions}>
                <Button variant="outline" icon="edit" onClick={handleEdit}>
                  {t.editBrand}
                </Button>
              </div>
            )}
          </div>

          <div className={styles.ratingBlock}>
            {typeof brandState.rating === "number" && brandState.rating_count > 0 ? (
              <div className={styles.ratingRow}>
                <span className={styles.ratingText}>
                  {brandState.rating.toFixed(1)} / 5 · {brandState.rating_count}
                </span>
                <StarRating rating={brandState.rating} />
              </div>
            ) : (
              <p className={styles.ratingEmpty}>{t.noRatingsYet}</p>
            )}

            {canRate && (
              <div className={styles.ratingActionRow}>
                <span className={styles.ratingActionLabel}>
                  {brandState.my_rating
                    ? `${t.yourRating}: ${brandState.my_rating}/5`
                    : t.rateBrand}
                </span>
                <RatingButtonRow
                  currentRating={brandState.my_rating}
                  isLoading={ratingLoading}
                  onSelect={handleRate}
                />
              </div>
            )}

            {ratingFeedback && (
              <p className={styles.ratingFeedback}>{ratingFeedback}</p>
            )}
          </div>

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

      {gallery.length > 0 && (
        <div className={styles.gallerySection}>
          <h2 className={styles.sectionTitle}>{t.gallery}</h2>
          <div className={styles.galleryScroll}>
            {gallery
              .sort((a, b) => a.order - b.order)
              .map((item) => (
                <div key={item.id} className={styles.galleryItem}>
                  <Image
                    src={proxyMediaUrl(item.url)!}
                    alt={`${brandState.name} gallery`}
                    fill
                    className={styles.galleryImage}
                    sizes="288px"
                  />
                </div>
              ))}
          </div>
        </div>
      )}

      {brandState.description && (
        <div className={styles.descriptionSection}>
          <h2 className={styles.sectionTitle}>{t.about}</h2>
          <p className={styles.description}>{brandState.description}</p>
        </div>
      )}

      <div className={styles.branchesSection}>
        <h2 className={styles.sectionTitle}>{t.branchesTitle} ({branches.length})</h2>
        {branches.length === 0 ? (
          <div className={styles.emptyState}>{t.noBranches}</div>
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
                    <span className={styles.branchHours}>{t.branchField247}</span>
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
