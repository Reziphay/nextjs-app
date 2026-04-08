"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Icon } from "@/components/icon";
import { useLocale } from "@/components/providers/locale-provider";
import { submitBrandRating } from "@/lib/brands-api";
import { proxyMediaUrl } from "@/lib/media";
import { selectAuthSession } from "@/store/auth";
import { useAppSelector } from "@/store/hooks";
import type { Brand, Branch, BrandStatus } from "@/types/brand";
import styles from "./brand-detail.module.css";

type BrandDetailProps = {
  brand: Brand;
  currentUserId?: string;
};

type BranchFilter = "all" | "open247" | "withContact";

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
                fill={
                  isActive
                    ? "var(--app-warning, #f59e0b)"
                    : "var(--app-border-strong, #d1d5db)"
                }
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

function getBranchAddress(branch: Branch) {
  return [branch.address1, branch.address2].filter(Boolean).join(", ");
}

function getBranchAvailability(branch: Branch, allDayLabel: string) {
  if (branch.is_24_7) return allDayLabel;
  if (branch.opening && branch.closing) {
    return `${branch.opening} – ${branch.closing}`;
  }
  return "—";
}

function hasBranchContact(branch: Branch) {
  return Boolean(branch.phone || branch.email);
}

export function BrandDetail({ brand, currentUserId }: BrandDetailProps) {
  const router = useRouter();
  const { messages } = useLocale();
  const t = messages.brands;
  const session = useAppSelector(selectAuthSession);
  const [brandState, setBrandState] = useState(brand);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingFeedback, setRatingFeedback] = useState<string | null>(null);
  const [branchFilter, setBranchFilter] = useState<BranchFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const isOwner = Boolean(currentUserId && brandState.owner_id === currentUserId);
  const categories = brandState.categories ?? [];
  const gallery = brandState.gallery ?? [];
  const branches = brandState.branches ?? [];
  const canRate =
    session.user?.type === "ucr" &&
    brandState.status === "ACTIVE" &&
    !isOwner;
  const normalizedRating =
    typeof brandState.rating === "number" ? brandState.rating : 0;
  const logoUrl = proxyMediaUrl(brandState.logo_url);
  const primaryCategory = categories[0]?.name;

  const STATUS_LABEL: Record<BrandStatus, string> = {
    PENDING: t.statusPending,
    ACTIVE: t.statusActive,
    REJECTED: t.statusRejected,
    CLOSED: t.statusClosed,
  };

  const filteredBranches = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return branches.filter((branch) => {
      if (branchFilter === "open247" && !branch.is_24_7) return false;
      if (branchFilter === "withContact" && !hasBranchContact(branch)) return false;

      if (!normalizedQuery) return true;

      const haystack = [
        branch.name,
        branch.description,
        branch.address1,
        branch.address2,
        branch.phone,
        branch.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [branches, branchFilter, searchQuery]);

  const stats = [
    {
      label: t.detailMetricCategories,
      value: String(categories.length),
    },
    {
      label: t.detailMetricBranches,
      value: String(branches.length),
    },
    {
      label: t.detailMetricGallery,
      value: String(gallery.length),
    },
    {
      label: t.detailMetricRating,
      value: normalizedRating.toFixed(1),
      hint:
        brandState.rating_count > 0
          ? `(${brandState.rating_count})`
          : undefined,
    },
  ];

  function handleEdit() {
    router.push(`/brands?progress=edit&id=${brandState.id}`);
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
      const updatedBrand = await submitBrandRating(
        brandState.id,
        value,
        accessToken,
      );
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
      <section className={styles.hero}>
        <div className={styles.heroMain}>
          <div className={styles.heroTop}>
            <span className={styles.eyebrow}>{t.detailStatusLabel}</span>
            <Badge variant={STATUS_BADGE_VARIANT[brandState.status]}>
              {STATUS_LABEL[brandState.status]}
            </Badge>
          </div>

          <h1 className={styles.heroTitle}>{brandState.name}</h1>
          <p className={styles.heroDescription}>
            {brandState.description?.trim() || t.detailDefaultDescription}
          </p>

          <div className={styles.ratingSummary}>
            <StarRating rating={normalizedRating} />
            <span className={styles.ratingValue}>
              {normalizedRating.toFixed(1)}
            </span>
            {brandState.rating_count > 0 ? (
              <span className={styles.ratingCount}>
                ({brandState.rating_count})
              </span>
            ) : null}
          </div>

          {canRate ? (
            <div className={styles.ratingActionCard}>
              <div className={styles.ratingActionHeader}>
                <span className={styles.ratingActionLabel}>
                  {brandState.my_rating
                    ? `${t.yourRating}: ${brandState.my_rating}/5`
                    : t.rateBrand}
                </span>
              </div>
              <RatingButtonRow
                currentRating={brandState.my_rating}
                isLoading={ratingLoading}
                onSelect={handleRate}
              />
              {ratingFeedback ? (
                <p className={styles.ratingFeedback}>{ratingFeedback}</p>
              ) : null}
            </div>
          ) : ratingFeedback ? (
            <p className={styles.ratingFeedback}>{ratingFeedback}</p>
          ) : null}

          {categories.length > 0 ? (
            <div className={styles.categoryRail}>
              {categories.map((cat) => (
                <span key={cat.id} className={styles.categoryChip}>
                  {cat.name}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <aside className={styles.heroAside}>
          {isOwner ? (
            <div className={styles.editRow}>
              <Button
                variant="primary"
                size="large"
                icon="edit"
                onClick={handleEdit}
                className={styles.editButton}
              >
                {t.editBrand}
              </Button>
            </div>
          ) : null}

          <div className={styles.logoCard}>
            {logoUrl ? (
              <div className={styles.logoFrame}>
                <Image
                  src={logoUrl}
                  alt={brandState.name}
                  fill
                  className={styles.logoImage}
                  sizes="160px"
                />
              </div>
            ) : (
              <div className={styles.logoFallback}>
                <Icon icon="sell" size={34} color="current" />
              </div>
            )}

            <div className={styles.logoMeta}>
              <div className={styles.logoStat}>
                <span className={styles.logoStatLabel}>
                  {t.detailMetricCategories}
                </span>
                <strong className={styles.logoStatValue}>
                  {primaryCategory ?? "—"}
                </strong>
              </div>
              <div className={styles.logoStatGrid}>
                <div className={styles.logoStatBox}>
                  <span className={styles.logoStatLabel}>
                    {t.detailMetricBranches}
                  </span>
                  <strong className={styles.logoStatValue}>
                    {branches.length}
                  </strong>
                </div>
                <div className={styles.logoStatBox}>
                  <span className={styles.logoStatLabel}>
                    {t.detailMetricGallery}
                  </span>
                  <strong className={styles.logoStatValue}>
                    {gallery.length}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className={styles.controlPanel}>
        <div className={styles.filterTabs} role="tablist" aria-label={t.branchesTitle}>
          {([
            ["all", t.detailFilterAllBranches],
            ["open247", t.detailFilterOpen247],
            ["withContact", t.detailFilterWithContact],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={branchFilter === value}
              className={`${styles.filterTab} ${branchFilter === value ? styles.filterTabActive : ""}`}
              onClick={() => setBranchFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <label className={styles.searchField}>
          <Icon icon="search" size={18} color="current" className={styles.searchIcon} />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={t.detailSearchPlaceholder}
            className={styles.searchInput}
            aria-label={t.detailSearchPlaceholder}
          />
        </label>
      </section>

      <section className={styles.branchPanel}>
        <div className={styles.tableHead}>
          <span>{t.detailTableBranch}</span>
          <span>{t.detailTableAddress}</span>
          <span>{t.detailTableAvailability}</span>
          <span>{t.detailTableContact}</span>
        </div>

        <div className={styles.tableBody}>
          {filteredBranches.length === 0 ? (
            <div className={styles.emptyState}>
              {branches.length === 0 ? t.noBranches : t.detailNoMatchingBranches}
            </div>
          ) : (
            filteredBranches.map((branch) => (
              <article key={branch.id} className={styles.branchRow}>
                <div className={styles.branchIdentity}>
                  <div className={styles.branchIconBox}>
                    <Icon icon="account_tree" size={24} color="current" />
                  </div>
                  <div className={styles.branchIdentityText}>
                    <p className={styles.branchName}>{branch.name}</p>
                    {branch.description ? (
                      <p className={styles.branchNote}>{branch.description}</p>
                    ) : null}
                  </div>
                </div>

                <div className={styles.branchCell}>
                  <p className={styles.branchAddress}>{getBranchAddress(branch)}</p>
                </div>

                <div className={styles.branchCell}>
                  <span
                    className={`${styles.availabilityBadge} ${branch.is_24_7 ? styles.availabilityLive : styles.availabilityMuted}`}
                  >
                    {getBranchAvailability(branch, t.branchField247)}
                  </span>
                </div>

                <div className={styles.branchCell}>
                  {hasBranchContact(branch) ? (
                    <div className={styles.contactStack}>
                      {branch.phone ? <span>{branch.phone}</span> : null}
                      {branch.email ? <span>{branch.email}</span> : null}
                    </div>
                  ) : (
                    <span className={styles.branchMuted}>—</span>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className={styles.metricsGrid}>
        {stats.map((item) => (
          <div key={item.label} className={styles.metricCard}>
            <span className={styles.metricLabel}>{item.label}</span>
            <div className={styles.metricValueRow}>
              <strong className={styles.metricValue}>{item.value}</strong>
              {item.hint ? <span className={styles.metricHint}>{item.hint}</span> : null}
            </div>
          </div>
        ))}
      </section>

      <section className={styles.galleryPanel}>
        <div className={styles.galleryHeader}>
          <span className={styles.eyebrow}>{t.gallery}</span>
          <h2 className={styles.galleryTitle}>{t.gallery}</h2>
        </div>

        {gallery.length === 0 ? (
          <div className={styles.emptyState}>{t.detailNoGalleryMedia}</div>
        ) : (
          <div className={styles.galleryGrid}>
            {gallery
              .sort((a, b) => a.order - b.order)
              .map((item) => {
                const imageUrl = proxyMediaUrl(item.url);
                if (!imageUrl) return null;

                return (
                  <div key={item.id} className={styles.galleryCard}>
                    <Image
                      src={imageUrl}
                      alt={`${brandState.name} gallery`}
                      fill
                      className={styles.galleryImage}
                      sizes="(max-width: 900px) 100vw, 33vw"
                    />
                  </div>
                );
              })}
          </div>
        )}
      </section>
    </div>
  );
}
