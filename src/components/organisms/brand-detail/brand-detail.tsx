"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { isAxiosError } from "axios";
import {
  Alert,
  AlertDescription,
  AlertDialog,
  AlertDialogContent,
} from "@/components/atoms";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Icon } from "@/components/icon";
import { ProfileBox } from "@/components/molecules";
import { useLocale } from "@/components/providers/locale-provider";
import { submitBrandRating } from "@/lib/brands-api";
import { translateBackendErrorMessage } from "@/lib/backend-errors";
import { proxyMediaUrl } from "@/lib/media";
import { selectAuthSession } from "@/store/auth";
import { useAppSelector } from "@/store/hooks";
import type { Brand, Branch, BrandStatus } from "@/types/brand";
import type { PublicUserProfile } from "@/types";
import styles from "./brand-detail.module.css";

type BrandDetailProps = {
  brand: Brand;
  currentUserId?: string;
  owner?: PublicUserProfile | null;
};

type BranchFilter = "all" | "open247" | "withContact";

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
                  <stop offset="50%" stopColor="var(--brand-warning)" />
                  <stop
                    offset="50%"
                    stopColor="var(--brand-border-strong)"
                  />
                </linearGradient>
              </defs>
            )}
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={
                isFull
                  ? "var(--brand-warning)"
                  : isHalf
                    ? `url(#${id})`
                    : "var(--brand-border-strong)"
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
                    ? "var(--brand-warning)"
                    : "var(--brand-border-strong)"
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

function getBranchBreaks(branch: Branch) {
  return branch.breaks
    .map((item) => [item.start, item.end].filter(Boolean).join(" – "))
    .filter(Boolean);
}

export function BrandDetail({
  brand,
  currentUserId,
  owner,
}: BrandDetailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { messages } = useLocale();
  const t = messages.brands;
  const session = useAppSelector(selectAuthSession);
  const currentUser = session.user;
  const dashboard = messages.dashboard;
  const [brandState, setBrandState] = useState(brand);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingFeedback, setRatingFeedback] = useState<string | null>(null);
  const [branchFilter, setBranchFilter] = useState<BranchFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [galleryPaused, setGalleryPaused] = useState(false);

  const isOwner = Boolean(currentUserId && brandState.owner_id === currentUserId);
  const categories = useMemo(
    () => brandState.categories ?? [],
    [brandState.categories],
  );
  const gallery = useMemo(() => brandState.gallery ?? [], [brandState.gallery]);
  const branches = useMemo(
    () => brandState.branches ?? [],
    [brandState.branches],
  );
  const canRate =
    currentUser?.type === "ucr" &&
    brandState.status === "ACTIVE" &&
    !isOwner;
  const normalizedRating =
    typeof brandState.rating === "number" ? brandState.rating : 0;
  const logoUrl = proxyMediaUrl(brandState.logo_url);
  const showCreatedAlert = searchParams.get("created") === "1";
  const showUpdatedAlert = searchParams.get("updated") === "1";
  const STATUS_LABEL: Record<BrandStatus, string> = {
    PENDING: t.statusPending,
    ACTIVE: t.statusActive,
    REJECTED: t.statusRejected,
    CLOSED: t.statusClosed,
  };
  const STATUS_CLASSNAME: Record<BrandStatus, string> = {
    PENDING: styles.statusWarm,
    ACTIVE: styles.statusSuccess,
    REJECTED: styles.statusError,
    CLOSED: styles.statusClosed,
  };
  const ownerDisplayName = owner
    ? `${owner.first_name} ${owner.last_name}`.trim() || owner.email
    : currentUser && currentUser.id === brandState.owner_id
      ? `${currentUser.first_name} ${currentUser.last_name}`.trim() ||
        currentUser.email
      : "";
  const ownerAvatar = owner
    ? proxyMediaUrl(owner.avatar_url) ?? "/reziphay-logo.png"
    : currentUser && currentUser.id === brandState.owner_id
      ? proxyMediaUrl(currentUser.avatar_url) ?? "/reziphay-logo.png"
      : "";
  const ownerSubtitle = owner?.email
    ? owner.email
    : currentUser && currentUser.id === brandState.owner_id
      ? currentUser.email ?? undefined
      : undefined;
  const ownerUserId = owner?.id
    ? owner.id
    : currentUser && currentUser.id === brandState.owner_id
      ? currentUser.id
      : undefined;
  const ownerProfileVisible = Boolean(ownerUserId && ownerDisplayName);

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

  const gallerySlides = useMemo(
    () =>
      [...gallery]
        .sort((a, b) => a.order - b.order)
        .map((item) => ({
          ...item,
          imageUrl: proxyMediaUrl(item.url),
        }))
        .filter(
          (
            item,
          ): item is typeof item & {
            imageUrl: string;
          } => Boolean(item.imageUrl),
        ),
    [gallery],
  );

  useEffect(() => {
    if (gallerySlides.length === 0) {
      setActiveGalleryIndex(0);
      return;
    }

    setActiveGalleryIndex((current) =>
      current >= gallerySlides.length ? 0 : current,
    );
  }, [gallerySlides.length]);

  useEffect(() => {
    if (gallerySlides.length <= 1 || galleryPaused) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveGalleryIndex((current) => (current + 1) % gallerySlides.length);
    }, 4200);

    return () => window.clearInterval(intervalId);
  }, [galleryPaused, gallerySlides.length]);

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
      const translatedApiMessage = translateBackendErrorMessage(
        apiMessage,
        messages.backendErrors,
      );

      if (apiMessage === "errors.forbidden") {
        setRatingFeedback(t.forbiddenDescription);
      } else if (apiMessage === "brand.not_found") {
        setRatingFeedback(t.notFoundDescription);
      } else {
        setRatingFeedback(translatedApiMessage ?? t.errorGeneric);
      }
    } finally {
      setRatingLoading(false);
    }
  }

  function showNextGallerySlide() {
    if (gallerySlides.length <= 1) return;
    setActiveGalleryIndex((current) => (current + 1) % gallerySlides.length);
  }

  function showPreviousGallerySlide() {
    if (gallerySlides.length <= 1) return;
    setActiveGalleryIndex(
      (current) => (current - 1 + gallerySlides.length) % gallerySlides.length,
    );
  }

  return (
    <div className={styles.wrapper}>
      {showCreatedAlert ? (
        <Alert variant="success" icon="check_circle" className={styles.pageAlert}>
          <AlertDescription>{t.createSuccessDescription}</AlertDescription>
        </Alert>
      ) : showUpdatedAlert ? (
        <Alert variant="success" icon="check_circle" className={styles.pageAlert}>
          <AlertDescription>{t.updateSuccessDescription}</AlertDescription>
        </Alert>
      ) : null}

      <section className={styles.hero}>
        <div className={styles.heroMain}>
          <div className={styles.heroTitleRow}>
            <span
              className={`${styles.statusPill} ${STATUS_CLASSNAME[brandState.status]}`}
            >
              {STATUS_LABEL[brandState.status]}
            </span>
            <h1 className={styles.heroTitle}>{brandState.name}</h1>
          </div>
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

          {ownerProfileVisible ? (
            <div className={styles.ownerRow}>
              <ProfileBox
                userId={ownerUserId}
                name={ownerDisplayName}
                avatar={ownerAvatar}
                label={t.brandCardOwnerLabel}
                subtitle={ownerSubtitle}
                className={styles.ownerProfile}
              />
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
              <button
                key={branch.id}
                type="button"
                className={styles.branchRow}
                onClick={() => setSelectedBranch(branch)}
                aria-label={`${branch.name} — ${t.detailBranchOpenDetails}`}
              >
                <div className={styles.branchIdentity}>
                  <div className={styles.branchIconBox}>
                    <Icon icon="account_tree" size={24} color="current" />
                  </div>
                  <div className={styles.branchIdentityText}>
                    <p className={styles.branchName}>{branch.name}</p>
                    <p className={styles.branchNote}>{t.detailBranchOpenDetails}</p>
                  </div>
                </div>

                <div className={`${styles.branchCell} ${styles.branchAddressCell}`}>
                  <p className={styles.branchAddress}>{getBranchAddress(branch)}</p>
                </div>

                <div className={`${styles.branchCell} ${styles.branchAvailabilityCell}`}>
                  <span
                    className={`${styles.availabilityBadge} ${branch.is_24_7 ? styles.availabilityLive : styles.availabilityMuted}`}
                  >
                    {getBranchAvailability(branch, t.branchField247)}
                  </span>
                </div>

                <div className={`${styles.branchCell} ${styles.branchContactCell}`}>
                  {hasBranchContact(branch) ? (
                    <div className={styles.contactStack}>
                      {branch.phone ? <span>{branch.phone}</span> : null}
                      {branch.email ? <span>{branch.email}</span> : null}
                    </div>
                  ) : (
                    <span className={styles.branchMuted}>—</span>
                  )}
                </div>
              </button>
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
          <h2 className={styles.galleryTitle}>{t.gallery}</h2>
        </div>

        {gallerySlides.length === 0 ? (
          <div className={styles.emptyState}>{t.detailNoGalleryMedia}</div>
        ) : (
          <div
            className={styles.galleryCarousel}
            onMouseEnter={() => setGalleryPaused(true)}
            onMouseLeave={() => setGalleryPaused(false)}
          >
            <div className={styles.galleryStage}>
              {gallerySlides.map((item, index) => (
                <div
                  key={item.id}
                  className={`${styles.gallerySlide} ${index === activeGalleryIndex ? styles.gallerySlideActive : ""}`}
                  aria-hidden={index === activeGalleryIndex ? undefined : true}
                >
                  <Image
                    src={item.imageUrl}
                    alt={`${brandState.name} gallery`}
                    fill
                    className={styles.galleryImage}
                    sizes="(max-width: 900px) 100vw, 70vw"
                    priority={index === activeGalleryIndex}
                  />
                </div>
              ))}

              {gallerySlides.length > 1 ? (
                <>
                  <div className={styles.galleryTopBar}>
                    <span className={styles.galleryCounter}>
                      {String(activeGalleryIndex + 1).padStart(2, "0")} /{" "}
                      {String(gallerySlides.length).padStart(2, "0")}
                    </span>
                    <span className={styles.galleryAutoplayHint}>
                      {galleryPaused
                        ? t.detailGalleryPaused
                        : t.detailGalleryAutoplay}
                    </span>
                  </div>

                  <div className={styles.galleryControls}>
                    <button
                      type="button"
                      className={styles.galleryNav}
                      onClick={showPreviousGallerySlide}
                      aria-label={t.detailGalleryPrevious}
                    >
                      <Icon icon="arrow_back" size={18} color="current" />
                    </button>

                    <div className={styles.galleryDots}>
                      {gallerySlides.map((item, index) => (
                        <button
                          key={item.id}
                          type="button"
                          className={`${styles.galleryDot} ${index === activeGalleryIndex ? styles.galleryDotActive : ""}`}
                          onClick={() => setActiveGalleryIndex(index)}
                          aria-label={`${t.gallery} ${index + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      className={styles.galleryNav}
                      onClick={showNextGallerySlide}
                      aria-label={t.detailGalleryNext}
                    >
                      <Icon icon="arrow_forward" size={18} color="current" />
                    </button>
                  </div>
                </>
              ) : null}
            </div>

            {gallerySlides.length > 1 ? (
              <div className={styles.galleryThumbRail}>
                {gallerySlides.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`${styles.galleryThumb} ${index === activeGalleryIndex ? styles.galleryThumbActive : ""}`}
                    onClick={() => setActiveGalleryIndex(index)}
                    aria-label={`${t.gallery} ${index + 1}`}
                  >
                    <Image
                      src={item.imageUrl}
                      alt={`${brandState.name} gallery thumbnail`}
                      fill
                      className={styles.galleryThumbImage}
                      sizes="88px"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </section>

      <AlertDialog
        open={Boolean(selectedBranch)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedBranch(null);
          }
        }}
      >
        <AlertDialogContent className={styles.branchDialogContent}>
          {selectedBranch ? (
            <>
              <div className={styles.branchDialogTop}>
                <div className={styles.branchDialogHero}>
                  <div className={styles.branchDialogIcon}>
                    <Icon icon="account_tree" size={24} color="current" />
                  </div>

                  <div className={styles.branchDialogTitleGroup}>
                    <h2 className={styles.branchDialogTitle}>
                      {selectedBranch.name || t.detailBranchModalTitle}
                    </h2>
                    <p className={styles.branchDialogDescription}>
                      {getBranchAddress(selectedBranch) || t.detailBranchModalDescription}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.branchDialogClose}
                  onClick={() => setSelectedBranch(null)}
                  aria-label={dashboard.cancel}
                >
                  <Icon icon="close" size={18} color="current" />
                </button>
              </div>

              <div className={styles.branchDialogBody}>
                {selectedBranch.description?.trim() ? (
                  <div className={styles.branchDialogSection}>
                    <span className={styles.branchDialogLabel}>
                      {t.branchFieldDescription}
                    </span>
                    <p className={styles.branchDialogText}>
                      {selectedBranch.description.trim()}
                    </p>
                  </div>
                ) : null}

                <div className={styles.branchDialogGrid}>
                  <div className={styles.branchDialogItem}>
                    <span className={styles.branchDialogLabel}>
                      {t.branchFieldAddress1}
                    </span>
                    <p className={styles.branchDialogText}>
                      {selectedBranch.address1}
                    </p>
                  </div>

                  {selectedBranch.address2?.trim() ? (
                    <div className={styles.branchDialogItem}>
                      <span className={styles.branchDialogLabel}>
                        {t.branchFieldAddress2}
                      </span>
                      <p className={styles.branchDialogText}>
                        {selectedBranch.address2.trim()}
                      </p>
                    </div>
                  ) : null}

                  <div className={styles.branchDialogItem}>
                    <span className={styles.branchDialogLabel}>
                      {t.detailTableAvailability}
                    </span>
                    <p className={styles.branchDialogText}>
                      {getBranchAvailability(selectedBranch, t.branchField247)}
                    </p>
                  </div>

                  {getBranchBreaks(selectedBranch).length > 0 ? (
                    <div className={styles.branchDialogItem}>
                      <span className={styles.branchDialogLabel}>
                        {t.branchFieldBreaks}
                      </span>
                      <div className={styles.branchDialogList}>
                        {getBranchBreaks(selectedBranch).map((item) => (
                          <span key={item} className={styles.branchDialogListItem}>
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {selectedBranch.phone?.trim() ? (
                    <div className={styles.branchDialogItem}>
                      <span className={styles.branchDialogLabel}>
                        {t.branchFieldPhone}
                      </span>
                      <p className={styles.branchDialogText}>
                        {selectedBranch.phone.trim()}
                      </p>
                    </div>
                  ) : null}

                  {selectedBranch.email?.trim() ? (
                    <div className={styles.branchDialogItem}>
                      <span className={styles.branchDialogLabel}>
                        {t.branchFieldEmail}
                      </span>
                      <p className={styles.branchDialogText}>
                        {selectedBranch.email.trim()}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
