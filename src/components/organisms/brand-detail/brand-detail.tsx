"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { isAxiosError } from "axios";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/atoms";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Icon } from "@/components/icon";
import { ProfileBox } from "@/components/molecules";
import { useLocale } from "@/components/providers/locale-provider";
import {
  fetchBrandTeamWorkspace,
  submitBrandRating,
  deleteBranchApi,
  type BrandTeamWorkspace,
  type TeamWorkspaceMember,
} from "@/lib/brands-api";
import { fetchPublicServices, deleteService } from "@/lib/services-api";
import { translateBackendErrorMessage } from "@/lib/backend-errors";
import { proxyMediaUrl } from "@/lib/media";
import { selectAuthSession } from "@/store/auth";
import { useAppSelector } from "@/store/hooks";
import type { Brand, Branch, BrandStatus } from "@/types/brand";
import type { PublicUserProfile } from "@/types";
import type { Service } from "@/types/service";
import { RichTextDisplay } from "@/components/molecules/rich-text-editor/rich-text-display";
import { StatusBanner } from "@/components/molecules/status-banner";
import { SocialIcon, SOCIAL_COLORS } from "@/components/atoms/social-icon/social-icon";
import styles from "./brand-detail.module.css";

type BrandDetailProps = {
  brand: Brand;
  currentUserId?: string;
  owner?: PublicUserProfile | null;
  actionSlot?: ReactNode;
};

type BranchFilter = "all" | "open247" | "withContact";

function formatServicePrice(service: Service, t: { serviceLabelFree: string; serviceLabelFrom: string }): string {
  if (service.price_type === "FREE") return t.serviceLabelFree;
  if (service.price === null) return "—";
  if (service.price_type === "STARTING_FROM") return `${t.serviceLabelFrom} ${service.price}`;
  return String(service.price);
}

function formatServiceDuration(minutes: number | null, unit: string): string {
  if (!minutes) return "—";
  if (minutes < 60) return `${minutes} ${unit}`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hourUnit =
    unit === "мин" ? "ч" : unit === "dəq" ? "saat" : unit === "dk" ? "sa" : "h";
  return m > 0 ? `${h}${hourUnit} ${m}${unit}` : `${h}${hourUnit}`;
}


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
          <Button
            variant="unstyled"
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
          </Button>
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

function formatTeamMemberName(
  member: Pick<TeamWorkspaceMember, "first_name" | "last_name">,
) {
  return `${member.first_name} ${member.last_name}`.trim();
}

function getTeamMemberInitials(
  member: Pick<TeamWorkspaceMember, "first_name" | "last_name">,
) {
  return `${member.first_name[0] ?? ""}${member.last_name[0] ?? ""}`.toUpperCase();
}

export function BrandDetail({
  brand,
  currentUserId,
  owner,
  actionSlot,
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
  const [teamWorkspace, setTeamWorkspace] = useState<BrandTeamWorkspace | null>(null);
  const [teamWorkspaceState, setTeamWorkspaceState] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [brandServices, setBrandServices] = useState<Service[]>([]);
  const [servicesState, setServicesState] = useState<"idle" | "loading" | "ready">("idle");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);
  const [deletingBranchId, setDeletingBranchId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<
    | { type: "service"; item: Service }
    | { type: "branch"; item: Branch }
    | null
  >(null);

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
  const accessToken = session.accessToken;
  const branchTeamMap = useMemo(
    () =>
      new Map(
        (teamWorkspace?.branches ?? []).map((branchItem) => [
          branchItem.branch_id,
          branchItem,
        ]),
      ),
    [teamWorkspace],
  );
  const totalBrandTeamMembers = useMemo(() => {
    const memberIds = new Set<string>();

    for (const branchItem of teamWorkspace?.branches ?? []) {
      for (const member of branchItem.members.accepted) {
        memberIds.add(member.user_id);
      }
    }

    return memberIds.size;
  }, [teamWorkspace]);

  useEffect(() => {
    const token = accessToken;

    if (!isOwner || !token) {
      setTeamWorkspace(null);
      setTeamWorkspaceState("idle");
      return;
    }

    const resolvedAccessToken: string = token;

    let active = true;
    setTeamWorkspaceState("loading");

    async function loadWorkspace() {
      try {
        const workspace = await fetchBrandTeamWorkspace(
          brandState.id,
          resolvedAccessToken,
        );

        if (!active) {
          return;
        }

        setTeamWorkspace(workspace);
        setTeamWorkspaceState("ready");
      } catch {
        if (!active) {
          return;
        }

        setTeamWorkspace(null);
        setTeamWorkspaceState("error");
      }
    }

    void loadWorkspace();

    return () => {
      active = false;
    };
  }, [accessToken, brandState.id, isOwner]);

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
  const selectedBranchTeam = useMemo(
    () => (selectedBranch ? branchTeamMap.get(selectedBranch.id) ?? null : null),
    [branchTeamMap, selectedBranch],
  );
  const selectedBranchCoverUrl = selectedBranch
    ? proxyMediaUrl(selectedBranch.cover_url ?? selectedBranchTeam?.cover_url ?? null)
    : null;

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

  // Lazy load active services for this brand's branches
  useEffect(() => {
    const branchIds = branches.map((b) => b.id);
    if (branchIds.length === 0) {
      setBrandServices([]);
      setServicesState("ready");
      return;
    }

    let active = true;
    setServicesState("loading");

    async function loadServices() {
      try {
        const allServices = await fetchPublicServices({}, session.accessToken ?? undefined);
        if (!active) return;
        const filtered = allServices.filter(
          (s) => s.status === "ACTIVE" && s.branch_id && branchIds.includes(s.branch_id),
        );
        setBrandServices(filtered);
        setServicesState("ready");
      } catch {
        if (!active) return;
        setBrandServices([]);
        setServicesState("ready");
      }
    }

    void loadServices();
    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandState.id]);

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
      label: t.detailMetricTeamMembers,
      value: !isOwner
        ? "—"
        : teamWorkspaceState === "loading"
          ? "…"
          : teamWorkspaceState === "ready"
            ? String(totalBrandTeamMembers)
            : "—",
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

  function handleEditService(svc: Service, e: React.MouseEvent) {
    e.stopPropagation();
    router.push(`/services?action=edit&id=${svc.id}`);
  }

  function handleDeleteService(svc: Service, e: React.MouseEvent) {
    e.stopPropagation();
    setDeleteTarget({ type: "service", item: svc });
  }

  function handleEditBranch(branch: Branch, e: React.MouseEvent) {
    e.stopPropagation();
    router.push(`/brands?progress=edit&id=${brandState.id}&branch=${branch.id}`);
  }

  function handleDeleteBranch(branch: Branch, e: React.MouseEvent) {
    e.stopPropagation();
    setDeleteTarget({ type: "branch", item: branch });
  }

  async function executeDelete() {
    const token = session.accessToken;
    if (!token || !deleteTarget) return;

    if (deleteTarget.type === "service") {
      const svc = deleteTarget.item;
      setDeletingServiceId(svc.id);
      setDeleteTarget(null);
      try {
        await deleteService(svc.id, token);
        setBrandServices((prev) => prev.filter((s) => s.id !== svc.id));
      } catch {
        // silent
      } finally {
        setDeletingServiceId(null);
      }
    } else {
      const branch = deleteTarget.item;
      setDeletingBranchId(branch.id);
      setDeleteTarget(null);
      try {
        await deleteBranchApi(brandState.id, branch.id, token);
        setBrandState((prev) => ({
          ...prev,
          branches: (prev.branches ?? []).filter((b) => b.id !== branch.id),
        }));
      } catch {
        // silent
      } finally {
        setDeletingBranchId(null);
      }
    }
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
        <StatusBanner variant="success" icon="check_circle">
          {t.createSuccessDescription}
        </StatusBanner>
      ) : showUpdatedAlert ? (
        <StatusBanner variant="success" icon="check_circle">
          {t.updateSuccessDescription}
        </StatusBanner>
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
          <RichTextDisplay
            html={brandState.description ?? ""}
            className={styles.heroDescription}
            emptyFallback={t.detailDefaultDescription}
          />

          {(() => {
            const links = [
              { key: "website_url",   platform: "website",   label: t.socialWebsite   },
              { key: "instagram_url", platform: "instagram",  label: t.socialInstagram },
              { key: "facebook_url",  platform: "facebook",   label: t.socialFacebook  },
              { key: "youtube_url",   platform: "youtube",    label: t.socialYoutube   },
              { key: "whatsapp_url",  platform: "whatsapp",   label: t.socialWhatsapp  },
              { key: "linkedin_url",  platform: "linkedin",   label: t.socialLinkedin  },
              { key: "x_url",         platform: "x",          label: t.socialX         },
            ] as const;
            const active = links.filter(({ key }) => brandState[key]);
            if (active.length === 0) return null;
            return (
              <div className={styles.socialLinks}>
                {active.map(({ key, platform, label }) => (
                  <a
                    key={key}
                    href={brandState[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    title={label}
                    style={{ color: SOCIAL_COLORS[platform] }}
                  >
                    <SocialIcon platform={platform} size={20} />
                  </a>
                ))}
              </div>
            );
          })()}

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
                  {messages.categories[cat.key as keyof typeof messages.categories] ?? cat.key}
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
                priority
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

          {actionSlot ? (
            <div className={styles.moderationActionCard}>{actionSlot}</div>
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
                    <Button
                      variant="unstyled"
                      type="button"
                      className={styles.galleryNav}
                      onClick={showPreviousGallerySlide}
                      aria-label={t.detailGalleryPrevious}
                    >
                      <Icon icon="arrow_back" size={18} color="current" />
                    </Button>

                    <div className={styles.galleryDots}>
                      {gallerySlides.map((item, index) => (
                        <Button
                          variant="unstyled"
                          key={item.id}
                          type="button"
                          className={`${styles.galleryDot} ${index === activeGalleryIndex ? styles.galleryDotActive : ""}`}
                          onClick={() => setActiveGalleryIndex(index)}
                          aria-label={`${t.gallery} ${index + 1}`}
                        />
                      ))}
                    </div>

                    <Button
                      variant="unstyled"
                      type="button"
                      className={styles.galleryNav}
                      onClick={showNextGallerySlide}
                      aria-label={t.detailGalleryNext}
                    >
                      <Icon icon="arrow_forward" size={18} color="current" />
                    </Button>
                  </div>
                </>
              ) : null}
            </div>

            {gallerySlides.length > 1 ? (
              <div className={styles.galleryThumbRail}>
                {gallerySlides.map((item, index) => (
                  <Button
                    variant="unstyled"
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
                  </Button>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </section>

      <section className={styles.servicesPanel}>
        <div className={styles.servicesPanelHeader}>
          <div className={styles.servicesPanelTitleGroup}>
            <h2 className={styles.servicesPanelTitle}>{t.serviceSectionTitle}</h2>
            {brandServices.length > 0 ? (
              <span className={styles.servicesCount}>{brandServices.length}</span>
            ) : null}
          </div>
          {isOwner ? (
            <Button
              variant="primary"
              size="small"
              icon="add"
              onClick={() => router.push(`/services?action=create&brand=${brandState.id}`)}
            >
              {t.serviceAdd}
            </Button>
          ) : null}
        </div>

        {servicesState === "loading" ? (
          <div className={styles.emptyState}>{t.serviceLoading}</div>
        ) : brandServices.length === 0 ? (
          <div className={styles.emptyStateServices}>
            <Icon icon="design_services" size={32} color="current" className={styles.emptyStateServicesIcon} />
            <p className={styles.emptyStateServicesText}>{t.serviceEmpty}</p>
            {isOwner ? (
              <Button
                variant="secondary"
                size="small"
                icon="add"
                onClick={() => router.push(`/services?action=create&brand=${brandState.id}`)}
              >
                {t.serviceAdd}
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            <div className={styles.servicesTableHead}>
              <span>{t.serviceTableService}</span>
              <span>{t.serviceTableBranch}</span>
              <span>{t.serviceTablePrice}</span>
              <span>{t.serviceTableDuration}</span>
            </div>
            <div className={styles.servicesTableBody}>
              {brandServices.map((svc) => {
                const priceLabel = formatServicePrice(svc, t);
                const durationLabel = formatServiceDuration(svc.duration, t.serviceLabelDurationUnit);
                const firstImg = svc.images[0];
                const imgUrl = firstImg ? proxyMediaUrl(firstImg.url) : null;
                const branchName = svc.branch_id
                  ? (branches.find((b) => b.id === svc.branch_id)?.name ?? "—")
                  : t.serviceModalIndividual;

                return (
                  <div
                    key={svc.id}
                    role="button"
                    tabIndex={0}
                    className={styles.serviceRow}
                    onClick={() => setSelectedService(svc)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedService(svc); }}
                    aria-label={svc.title}
                  >
                    <div className={styles.serviceIdentity}>
                      {imgUrl ? (
                        <div className={styles.serviceThumb}>
                          <Image
                            src={imgUrl}
                            alt={svc.title}
                            fill
                            className={styles.serviceThumbImage}
                            sizes="56px"
                          />
                        </div>
                      ) : (
                        <div className={styles.serviceThumbPlaceholder}>
                          <Icon icon="design_services" size={22} color="current" />
                        </div>
                      )}
                      <div className={styles.serviceIdentityText}>
                        <p className={styles.serviceName}>{svc.title}</p>
                        {svc.service_category ? (
                          <span className={styles.serviceCategory}>
                            {messages.categories[svc.service_category.key as keyof typeof messages.categories] ?? svc.service_category.key}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className={`${styles.serviceCell} ${styles.serviceBranchCell}`}>
                      <span className={styles.serviceBranchName}>{branchName}</span>
                    </div>

                    <div className={`${styles.serviceCell} ${styles.servicePriceCell}`}>
                      <span className={styles.servicePricePill}>{priceLabel}</span>
                    </div>

                    <div className={`${styles.serviceCell} ${styles.serviceDurationCell}`}>
                      {durationLabel !== "—" ? (
                        <span className={styles.serviceDurationPill}>
                          <Icon icon="schedule" size={13} color="current" />
                          {durationLabel}
                        </span>
                      ) : (
                        <span className={styles.serviceMuted}>—</span>
                      )}
                    </div>

                    {isOwner ? (
                      <div className={styles.rowActions} onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="unstyled"
                          type="button"
                          className={styles.rowActionBtn}
                          onClick={(e) => handleEditService(svc, e)}
                          aria-label={`${t.serviceActionEdit}: ${svc.title}`}
                          title={t.serviceActionEdit}
                        >
                          <Icon icon="edit" size={15} color="current" />
                        </Button>
                        <Button
                          variant="unstyled"
                          type="button"
                          className={`${styles.rowActionBtn} ${styles.rowActionBtnDanger}`}
                          onClick={(e) => handleDeleteService(svc, e)}
                          disabled={deletingServiceId === svc.id}
                          aria-label={`${t.serviceActionDelete}: ${svc.title}`}
                          title={t.serviceActionDelete}
                        >
                          <Icon icon="delete" size={15} color="current" />
                        </Button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      <div className={styles.branchesSectionHeader}>
        <div className={styles.branchesSectionTitleGroup}>
          <h2 className={styles.branchesSectionTitle}>{t.branchesTitle}</h2>
          {branches.length > 0 ? (
            <span className={styles.branchesCount}>{branches.length}</span>
          ) : null}
        </div>
        {isOwner ? (
          <Button
            variant="primary"
            size="small"
            icon="add"
            onClick={() => router.push(`/brands?progress=edit&id=${brandState.id}&addBranch=1`)}
          >
            {t.addBranch}
          </Button>
        ) : null}
      </div>

      <section className={styles.controlPanel}>
        <div className={styles.filterTabs} role="tablist" aria-label={t.branchesTitle}>
          {([
            ["all", t.detailFilterAllBranches],
            ["open247", t.detailFilterOpen247],
            ["withContact", t.detailFilterWithContact],
          ] as const).map(([value, label]) => (
            <Button
              variant="unstyled"
              key={value}
              type="button"
              role="tab"
              aria-selected={branchFilter === value}
              className={`${styles.filterTab} ${branchFilter === value ? styles.filterTabActive : ""}`}
              onClick={() => setBranchFilter(value)}
            >
              {label}
            </Button>
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
            filteredBranches.map((branch) => {
              const branchCoverUrl = proxyMediaUrl(branch.cover_url ?? null);

              return (
                <div
                  key={branch.id}
                  role="button"
                  tabIndex={0}
                  className={styles.branchRow}
                  onClick={() => setSelectedBranch(branch)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedBranch(branch); }}
                  aria-label={`${branch.name} — ${t.detailBranchOpenDetails}`}
                >
                  <div className={styles.branchIdentity}>
                    {branchCoverUrl ? (
                      <div className={styles.branchCoverThumb}>
                        <Image
                          src={branchCoverUrl}
                          alt={`${branch.name} cover`}
                          fill
                          className={styles.branchCoverThumbImage}
                          sizes="64px"
                        />
                      </div>
                    ) : (
                      <div className={styles.branchIconBox}>
                        <Icon icon="account_tree" size={24} color="current" />
                      </div>
                    )}
                    <div className={styles.branchIdentityText}>
                      <p className={styles.branchName}>{branch.name}</p>
                      <p className={styles.branchNote}>{t.branchDetailRowHint}</p>
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

                  {isOwner ? (
                    <div className={styles.rowActions} onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="unstyled"
                        type="button"
                        className={styles.rowActionBtn}
                        onClick={(e) => handleEditBranch(branch, e)}
                        aria-label={`${t.serviceActionEdit}: ${branch.name}`}
                        title={t.serviceActionEdit}
                      >
                        <Icon icon="edit" size={15} color="current" />
                      </Button>
                      <Button
                        variant="unstyled"
                        type="button"
                        className={`${styles.rowActionBtn} ${styles.rowActionBtnDanger}`}
                        onClick={(e) => handleDeleteBranch(branch, e)}
                        disabled={deletingBranchId === branch.id}
                        aria-label={`${t.serviceActionDelete}: ${branch.name}`}
                        title={t.serviceActionDelete}
                      >
                        <Icon icon="delete" size={15} color="current" />
                      </Button>
                    </div>
                  ) : null}
                </div>
              );
            })
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

      <AlertDialog
        open={Boolean(selectedService)}
        onOpenChange={(open) => {
          if (!open) setSelectedService(null);
        }}
      >
        <AlertDialogContent className={styles.branchDialogContent}>
          {selectedService ? (
            <>
              <div className={styles.branchDialogTop}>
                <div className={styles.branchDialogHero}>
                  <div className={styles.branchDialogIcon}>
                    <Icon icon="design_services" size={24} color="current" />
                  </div>
                  <div className={styles.branchDialogTitleGroup}>
                    <h2 className={styles.branchDialogTitle}>{selectedService.title}</h2>
                    {selectedService.service_category ? (
                      <p className={styles.branchDialogDescription}>{messages.categories[selectedService.service_category.key as keyof typeof messages.categories] ?? selectedService.service_category.key}</p>
                    ) : null}
                  </div>
                </div>
                <Button
                  variant="unstyled"
                  type="button"
                  className={styles.branchDialogClose}
                  onClick={() => setSelectedService(null)}
                  aria-label={t.serviceModalClose}
                >
                  <Icon icon="close" size={18} color="current" />
                </Button>
              </div>

              <div className={styles.branchDialogBody}>
                {selectedService.description?.trim() ? (
                  <div className={styles.branchDialogSection}>
                    <span className={styles.branchDialogLabel}>{t.serviceModalDescription}</span>
                    <RichTextDisplay html={selectedService.description} className={styles.branchDialogText} />
                  </div>
                ) : null}

                <div className={styles.branchDialogGrid}>
                  <div className={styles.branchDialogItem}>
                    <span className={styles.branchDialogLabel}>{t.serviceModalPrice}</span>
                    <p className={styles.branchDialogText}>{formatServicePrice(selectedService, t)}</p>
                  </div>

                  {selectedService.duration ? (
                    <div className={styles.branchDialogItem}>
                      <span className={styles.branchDialogLabel}>{t.serviceModalDuration}</span>
                      <p className={styles.branchDialogText}>
                        {formatServiceDuration(selectedService.duration, t.serviceLabelDurationUnit)}
                      </p>
                    </div>
                  ) : null}

                  {selectedService.branch_id ? (
                    <div className={styles.branchDialogItem}>
                      <span className={styles.branchDialogLabel}>{t.serviceModalBranch}</span>
                      <p className={styles.branchDialogText}>
                        {branches.find((b) => b.id === selectedService.branch_id)?.name ?? selectedService.branch_id}
                      </p>
                    </div>
                  ) : selectedService.address ? (
                    <div className={styles.branchDialogItem}>
                      <span className={styles.branchDialogLabel}>{t.serviceModalAddress}</span>
                      <p className={styles.branchDialogText}>{selectedService.address}</p>
                    </div>
                  ) : null}
                </div>

                {selectedService.images.length > 0 ? (
                  <div className={styles.serviceModalImages}>
                    {selectedService.images.map((img) => {
                      const imgUrl = proxyMediaUrl(img.url);
                      if (!imgUrl) return null;
                      return (
                        <div key={img.id} className={styles.serviceModalImageFrame}>
                          <Image
                            src={imgUrl}
                            alt={selectedService.title}
                            fill
                            className={styles.serviceModalImage}
                            sizes="(max-width: 640px) 50vw, 180px"
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </AlertDialogContent>
      </AlertDialog>

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

                <Button
                  variant="unstyled"
                  type="button"
                  className={styles.branchDialogClose}
                  onClick={() => setSelectedBranch(null)}
                  aria-label={dashboard.cancel}
                >
                  <Icon icon="close" size={18} color="current" />
                </Button>
              </div>

              <div className={styles.branchDialogBody}>
                <div className={styles.branchStudioGrid}>
                  <article className={styles.branchStudioCard}>
                    <div className={styles.branchStudioCardHeader}>
                      <div>
                        <h3 className={styles.branchStudioTitle}>
                          {t.branchDetailVisualTitle}
                        </h3>
                        <p className={styles.branchStudioLead}>
                          {t.branchDetailVisualLead}
                        </p>
                      </div>
                      <span className={styles.branchStudioBadge}>
                        {selectedBranchCoverUrl
                          ? t.branchDetailPhotoReady
                          : t.branchDetailPhotoEmpty}
                      </span>
                    </div>

                    <div className={styles.branchVisualStage}>
                      {selectedBranchCoverUrl ? (
                        <>
                          <Image
                            src={selectedBranchCoverUrl}
                            alt={`${selectedBranch.name} cover`}
                            fill
                            className={styles.branchVisualImage}
                            sizes="(max-width: 960px) 100vw, 420px"
                          />
                          <div className={styles.branchVisualOverlay}>
                            <strong>{selectedBranch.name}</strong>
                            <span>{t.branchDetailVisualHint}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className={styles.branchVisualPlaceholder}>
                            <Icon icon="sell" size={22} color="current" />
                          </div>
                          <div className={styles.branchVisualOverlay}>
                            <strong>{selectedBranch.name}</strong>
                            <span>{t.branchDetailVisualEmptyHint}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </article>

                  <article className={styles.branchStudioCard}>
                    <div className={styles.branchStudioCardHeader}>
                      <div>
                        <h3 className={styles.branchStudioTitle}>
                          {t.branchDetailTeamTitle}
                        </h3>
                        <p className={styles.branchStudioLead}>
                          {t.branchDetailTeamLead}
                        </p>
                      </div>
                      <span className={styles.branchStudioBadge}>
                        {t.branchDetailTeamBadge}
                      </span>
                    </div>

                    {isOwner ? (
                      teamWorkspaceState === "loading" ? (
                        <p className={styles.branchStudioMuted}>
                          {t.branchDetailTeamLoading}
                        </p>
                      ) : teamWorkspaceState === "error" ? (
                        <p className={styles.branchStudioMuted}>
                          {t.branchDetailTeamError}
                        </p>
                      ) : (
                        <>
                          <div className={styles.branchTeamMetrics}>
                            <div className={styles.branchTeamMetric}>
                              <span>{t.branchDetailAccepted}</span>
                              <strong>
                                {selectedBranchTeam?.members.accepted.length ?? 0}
                              </strong>
                            </div>
                            <div className={styles.branchTeamMetric}>
                              <span>{t.branchDetailPending}</span>
                              <strong>
                                {selectedBranchTeam?.members.pending.length ?? 0}
                              </strong>
                            </div>
                            <div className={styles.branchTeamMetric}>
                              <span>{t.branchDetailArchived}</span>
                              <strong>
                                {(selectedBranchTeam?.members.rejected.length ?? 0) +
                                  (selectedBranchTeam?.members.removed.length ?? 0)}
                              </strong>
                            </div>
                          </div>

                          {selectedBranchTeam &&
                          selectedBranchTeam.members.accepted.length > 0 ? (
                            <div className={styles.branchMemberRail}>
                              {selectedBranchTeam.members.accepted.map((member) => {
                                const avatarUrl = proxyMediaUrl(member.avatar_url);

                                return (
                                  <div
                                    key={member.membership_id}
                                    className={styles.branchMemberChip}
                                  >
                                    <div
                                      className={styles.branchMemberAvatar}
                                      style={
                                        avatarUrl
                                          ? { backgroundImage: `url(${avatarUrl})` }
                                          : undefined
                                      }
                                      data-has-image={avatarUrl ? "true" : "false"}
                                    >
                                      {!avatarUrl
                                        ? getTeamMemberInitials(member)
                                        : null}
                                    </div>
                                    <div className={styles.branchMemberMeta}>
                                      <strong>{formatTeamMemberName(member)}</strong>
                                      <span>
                                        {member.role === "OWNER"
                                          ? t.branchDetailOwner
                                          : t.branchDetailMember}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className={styles.branchStudioMuted}>
                              {t.branchDetailTeamEmpty}
                            </p>
                          )}
                        </>
                      )
                    ) : (
                      <p className={styles.branchStudioMuted}>
                        {t.branchDetailTeamLead}
                      </p>
                    )}

                  </article>
                </div>

                {selectedBranch.description?.trim() ? (
                  <div className={styles.branchDialogSection}>
                    <span className={styles.branchDialogLabel}>
                      {t.branchFieldDescription}
                    </span>
                    <RichTextDisplay
                      html={selectedBranch.description}
                      className={styles.branchDialogText}
                    />
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

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTarget?.type === "service"
                ? `${t.serviceActionDelete}: ${deleteTarget.item.title}`
                : `${t.deleteBranch}: ${deleteTarget?.item.name}`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t.deleteModalDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>
              {dashboard.cancel}
            </AlertDialogCancel>
            <Button variant="primary" onClick={executeDelete}>
              {t.deleteConfirm}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
