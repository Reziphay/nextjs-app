"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
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
import { DataTable, type DataTableColumn, ProfileBox } from "@/components/molecules";
import { useLocale } from "@/components/providers/locale-provider";
import {
  fetchBrandTeamWorkspace,
  submitBrandRating,
  deleteBranchApi,
  type BrandTeamWorkspace,
  type TeamWorkspaceMember,
} from "@/lib/brands-api";
import {
  fetchPublicServices,
  fetchAssignableBrandServices,
  fetchBrandServiceAssignmentRequests,
  requestServiceAssignment,
  approveServiceAssignment,
  rejectServiceAssignment,
  withdrawServiceAssignment,
} from "@/lib/services-api";
import { translateBackendErrorMessage } from "@/lib/backend-errors";
import { proxyMediaUrl } from "@/lib/media";
import { selectAuthSession } from "@/store/auth";
import { useAppSelector } from "@/store/hooks";
import type { Brand, Branch, BrandStatus } from "@/types/brand";
import type { PublicUserProfile } from "@/types";
import type { Service, AssignableService, ServiceAssignmentRequest } from "@/types/service";
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
  const [deletingBranchId, setDeletingBranchId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<
    { type: "branch"; item: Branch } | null
  >(null);

  const isOwner =
    brandState.viewer_role === "OWNER" ||
    Boolean(currentUserId && brandState.owner_id === currentUserId);
  const isMember = brandState.viewer_role === "MEMBER";
  const canSelfAssignServices = isOwner || isMember;
  const viewerBranchId = brandState.viewer_branch_id ?? null;
  const [assignableServices, setAssignableServices] = useState<
    AssignableService[]
  >([]);
  const [assignableState, setAssignableState] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [assignmentBusyId, setAssignmentBusyId] = useState<string | null>(null);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const [assignmentDraftService, setAssignmentDraftService] =
    useState<AssignableService | null>(null);
  const [assignmentDraft, setAssignmentDraft] = useState({
    proposed_description: "",
    proposed_price: "",
    proposed_duration: "",
  });
  const [ownerAssignmentRequests, setOwnerAssignmentRequests] = useState<
    ServiceAssignmentRequest[]
  >([]);
  const [ownerAssignmentRequestsState, setOwnerAssignmentRequestsState] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const ownerRequestsSectionRef = useRef<HTMLElement | null>(null);
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

    if (!canSelfAssignServices || !token) {
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
  }, [accessToken, brandState.id, canSelfAssignServices]);

  useEffect(() => {
    if (!canSelfAssignServices || !accessToken) {
      setAssignableServices([]);
      setAssignableState("idle");
      return;
    }

    const token = accessToken;
    let active = true;
    setAssignableState("loading");

    (async () => {
      try {
        const services = await fetchAssignableBrandServices(brandState.id, token);
        if (!active) return;
        setAssignableServices(services);
        setAssignableState("ready");
      } catch {
        if (!active) return;
        setAssignableServices([]);
        setAssignableState("error");
      }
    })();

    return () => {
      active = false;
    };
  }, [accessToken, brandState.id, canSelfAssignServices]);

  useEffect(() => {
    if (!isOwner || !accessToken) {
      setOwnerAssignmentRequests([]);
      setOwnerAssignmentRequestsState("idle");
      return;
    }

    const token = accessToken;
    let active = true;
    setOwnerAssignmentRequestsState("loading");

    (async () => {
      try {
        const requests = await fetchBrandServiceAssignmentRequests(
          brandState.id,
          token,
        );
        if (!active) return;
        setOwnerAssignmentRequests(requests);
        setOwnerAssignmentRequestsState("ready");
      } catch {
        if (!active) return;
        setOwnerAssignmentRequests([]);
        setOwnerAssignmentRequestsState("error");
      }
    })();

    return () => {
      active = false;
    };
  }, [accessToken, brandState.id, isOwner]);

  useEffect(() => {
    if (!isOwner || ownerAssignmentRequestsState === "loading") {
      return;
    }

    if (window.location.hash !== "#assignment-requests") {
      return;
    }

    window.setTimeout(() => {
      ownerRequestsSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 80);
  }, [isOwner, ownerAssignmentRequestsState, ownerAssignmentRequests.length]);

  function openAssignmentDraft(service: AssignableService) {
    setAssignmentError(null);
    setAssignmentDraftService(service);
    setAssignmentDraft({
      proposed_description: service.description ?? "",
      proposed_price: service.price == null ? "" : String(service.price),
      proposed_duration: service.duration == null ? "" : String(service.duration),
    });
  }

  async function handleRequestAssignment(serviceId: string) {
    if (!accessToken || assignmentBusyId) return;
    setAssignmentBusyId(serviceId);
    setAssignmentError(null);
    try {
      const assignment = await requestServiceAssignment(
        brandState.id,
        serviceId,
        accessToken,
        {
          proposed_description:
            assignmentDraft.proposed_description.trim() || null,
          proposed_price:
            assignmentDraft.proposed_price.trim() === ""
              ? null
              : Number(assignmentDraft.proposed_price),
          proposed_duration:
            assignmentDraft.proposed_duration.trim() === ""
              ? null
              : Number(assignmentDraft.proposed_duration),
        },
      );
      setAssignableServices((prev) =>
        prev.map((s) =>
          s.id === serviceId ? { ...s, my_assignment: assignment } : s,
        ),
      );
      setAssignmentDraftService(null);
    } catch (err) {
      const fallback = t.assignmentErrorGeneric ?? "Could not submit request.";
      const apiMessage = isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message
        : undefined;
      const translated = translateBackendErrorMessage(
        apiMessage,
        messages.backendErrors,
      );
      setAssignmentError(translated ?? fallback);
    } finally {
      setAssignmentBusyId(null);
    }
  }

  async function handleWithdrawAssignment(assignmentId: string, serviceId: string) {
    if (!accessToken || assignmentBusyId) return;
    setAssignmentBusyId(serviceId);
    setAssignmentError(null);
    try {
      await withdrawServiceAssignment(assignmentId, accessToken);
      setAssignableServices((prev) =>
        prev.map((s) =>
          s.id === serviceId ? { ...s, my_assignment: null } : s,
        ),
      );
    } catch (err) {
      const fallback = t.assignmentErrorGeneric ?? "Could not withdraw.";
      const apiMessage = isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message
        : undefined;
      const translated = translateBackendErrorMessage(
        apiMessage,
        messages.backendErrors,
      );
      setAssignmentError(translated ?? fallback);
    } finally {
      setAssignmentBusyId(null);
    }
  }

  async function handleOwnerAssignmentAction(
    assignmentId: string,
    action: "approve" | "reject",
  ) {
    if (!accessToken || assignmentBusyId) return;
    setAssignmentBusyId(assignmentId);
    setAssignmentError(null);
    try {
      if (action === "approve") {
        await approveServiceAssignment(assignmentId, accessToken);
      } else {
        await rejectServiceAssignment(assignmentId, accessToken);
      }
      setOwnerAssignmentRequests((prev) =>
        prev.filter((item) => item.assignment.id !== assignmentId),
      );
    } catch (err) {
      const fallback = t.assignmentErrorGeneric ?? "Could not update request.";
      const apiMessage = isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message
        : undefined;
      const translated = translateBackendErrorMessage(
        apiMessage,
        messages.backendErrors,
      );
      setAssignmentError(translated ?? fallback);
    } finally {
      setAssignmentBusyId(null);
    }
  }

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

  // Lazy load active services for this brand on the API side.
  useEffect(() => {
    let active = true;
    setServicesState("loading");

    async function loadServices() {
      try {
        const services = await fetchPublicServices(
          { brand_id: brand.id, limit: 200 },
          session.accessToken ?? undefined,
        );
        if (!active) return;
        setBrandServices(services);
        setServicesState("ready");
      } catch {
        if (!active) return;
        setBrandServices([]);
        setServicesState("ready");
      }
    }

    void loadServices();
    return () => { active = false; };
  }, [brand.id, session.accessToken]);

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

      {!canSelfAssignServices ? (
        <section className={styles.servicesPanel}>
          <div className={styles.servicesPanelHeader}>
            <div className={styles.servicesPanelTitleGroup}>
              <h2 className={styles.servicesPanelTitle}>{t.serviceSectionTitle}</h2>
              {brandServices.length > 0 ? (
                <span className={styles.servicesCount}>{brandServices.length}</span>
              ) : null}
            </div>
          </div>

          {servicesState === "loading" ? (
            <div className={styles.emptyState}>{t.serviceLoading}</div>
          ) : brandServices.length === 0 ? (
            <div className={styles.emptyStateServices}>
              <Icon icon="design_services" size={32} color="current" className={styles.emptyStateServicesIcon} />
              <p className={styles.emptyStateServicesText}>{t.serviceEmpty}</p>
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
                  const ownerName = svc.brand?.name ?? t.serviceModalIndividual;

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
                            <Icon icon="design_services" size={14} color="current" />
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
                        <span className={styles.serviceBranchName}>{ownerName}</span>
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

                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      ) : null}

      {canSelfAssignServices ? (
        <section
          id="assignment-requests"
          ref={ownerRequestsSectionRef}
          className={styles.assignmentPanel}
        >
          <div className={styles.servicesPanelHeader}>
            <div className={styles.servicesPanelTitleGroup}>
              <h2 className={styles.servicesPanelTitle}>
                {t.assignmentSectionTitle}
              </h2>
              {assignableServices.length > 0 ? (
                <span className={styles.servicesCount}>
                  {assignableServices.length}
                </span>
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

          {assignmentError ? (
            <StatusBanner variant="error">{assignmentError}</StatusBanner>
          ) : null}

          {assignableState === "loading" ? (
            <div className={styles.emptyState}>{t.serviceLoading}</div>
          ) : assignableServices.length === 0 ? (
            <div className={styles.emptyStateServices}>
              <Icon
                icon="design_services"
                size={32}
                color="current"
                className={styles.emptyStateServicesIcon}
              />
              <p className={styles.emptyStateServicesText}>
                {t.assignmentEmpty}
              </p>
            </div>
          ) : (
            <DataTable<AssignableService>
              rows={assignableServices}
              getRowId={(svc) => svc.id}
              tableClassName={`${styles.assignmentDataTable} ${styles.assignableServicesTable}`}
              columns={[
                {
                  id: "service",
                  header: t.serviceTableService,
                  width: "24%",
                  render: (svc) => {
                    const firstImg = svc.images[0];
                    const imgUrl = firstImg ? proxyMediaUrl(firstImg.url) : null;

                    return (
                      <Button
                        variant="unstyled"
                        type="button"
                        className={`${styles.serviceIdentity} ${styles.serviceIdentityLink}`}
                        onClick={() => router.push(`/services?id=${svc.id}`)}
                        aria-label={svc.title}
                      >
                        {imgUrl ? (
                          <div className={styles.serviceThumb}>
                            <Image
                              src={imgUrl}
                              alt={svc.title}
                              fill
                              className={styles.serviceThumbImage}
                              sizes="28px"
                            />
                          </div>
                        ) : (
                          <div className={styles.serviceThumbPlaceholder}>
                            <Icon icon="design_services" size={22} color="current" />
                          </div>
                        )}
                        <div className={styles.serviceIdentityText}>
                          <p className={styles.serviceName}>{svc.title}</p>
                        </div>
                      </Button>
                    );
                  },
                },
                {
                  id: "members",
                  header: t.assignmentStatsMembers,
                  width: "5.8rem",
                  align: "center",
                  render: (svc) => (
                    <span className={styles.assignmentStatValue}>
                      {svc.assigned_team_members_count}
                    </span>
                  ),
                },
                {
                  id: "branches",
                  header: t.assignmentStatsBranches,
                  width: "4.8rem",
                  align: "center",
                  render: (svc) => (
                    <span className={styles.assignmentStatValue}>
                      {svc.assigned_branches_count}
                    </span>
                  ),
                },
                {
                  id: "price",
                  header: t.serviceTablePrice,
                  width: "4.8rem",
                  align: "center",
                  render: (svc) => {
                    const priceLabel =
                      svc.price_type === "FREE"
                        ? t.serviceLabelFree
                        : svc.price === null
                          ? "—"
                          : svc.price_type === "STARTING_FROM"
                            ? `${t.serviceLabelFrom} ${svc.price}`
                            : String(svc.price);

                    return (
                      <span className={styles.servicePricePill}>{priceLabel}</span>
                    );
                  },
                },
                {
                  id: "duration",
                  header: t.serviceTableDuration,
                  width: "6rem",
                  align: "center",
                  render: (svc) => {
                    const durationLabel = formatServiceDuration(
                      svc.duration,
                      t.serviceLabelDurationUnit,
                    );

                    return durationLabel !== "—" ? (
                      <span className={styles.serviceDurationPill}>
                        <Icon icon="schedule" size={11} color="current" />
                        {durationLabel}
                      </span>
                    ) : (
                      <span className={styles.assignmentEmptyCell}>—</span>
                    );
                  },
                },
                {
                  id: "status",
                  header: t.assignmentTableStatus,
                  width: "6.8rem",
                  align: "center",
                  render: (svc) => {
                    const a =
                      svc.my_assignment?.status === "WITHDRAWN"
                        ? null
                        : svc.my_assignment;
                    const status = a?.status ?? null;
                    const initiator = a?.initiated_by ?? null;
                    let statusBadge: { text: string; className: string } | null =
                      null;

                    if (status === "PENDING") {
                      statusBadge = {
                        text:
                          initiator === "MEMBER"
                            ? t.assignmentStatusPending
                            : t.assignmentStatusOwnerOffer,
                        className: styles.statusWarm,
                      };
                    } else if (status === "ACCEPTED") {
                      statusBadge = {
                        text: t.assignmentStatusAccepted,
                        className: styles.statusSuccess,
                      };
                    } else if (status === "REJECTED") {
                      statusBadge = {
                        text: t.assignmentStatusRejected,
                        className: styles.statusError,
                      };
                    }

                    return statusBadge ? (
                      <span
                        className={`${styles.assignmentStatusBadge} ${statusBadge.className}`}
                      >
                        {statusBadge.text}
                      </span>
                    ) : (
                      <span className={styles.assignmentEmptyCell}>—</span>
                    );
                  },
                },
                {
                  id: "actions",
                  header: t.assignmentTableActions,
                  width: "9rem",
                  align: "right",
                  render: (svc) => {
                    const a =
                      svc.my_assignment?.status === "WITHDRAWN"
                        ? null
                        : svc.my_assignment;
                    const status = a?.status ?? null;
                    const initiator = a?.initiated_by ?? null;
                    const busy = assignmentBusyId === svc.id;

                    return (
                      <div className={styles.assignmentActions}>
                        {!status || status === "REJECTED" ? (
                          <Button
                            variant="secondary"
                            size="small"
                            icon="check"
                            onClick={() => openAssignmentDraft(svc)}
                            disabled={busy}
                          >
                            {status === "REJECTED"
                              ? t.assignmentActionRequestAgain
                              : t.assignmentActionRequest}
                          </Button>
                        ) : status === "PENDING" && initiator === "MEMBER" ? (
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={() =>
                              a && handleWithdrawAssignment(a.id, svc.id)
                            }
                            disabled={busy}
                          >
                            {t.assignmentActionWithdraw}
                          </Button>
                        ) : status === "ACCEPTED" ? (
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={() =>
                              a && handleWithdrawAssignment(a.id, svc.id)
                            }
                            disabled={busy}
                          >
                            {t.assignmentActionStepDown}
                          </Button>
                        ) : null}
                      </div>
                    );
                  },
                },
              ] satisfies DataTableColumn<AssignableService>[]}
            />
          )}
        </section>
      ) : null}

      {isOwner ? (
        <section className={styles.assignmentPanel}>
          <div className={styles.servicesPanelHeader}>
            <div className={styles.servicesPanelTitleGroup}>
              <h2 className={styles.servicesPanelTitle}>
                {t.assignmentOwnerRequestsTitle}
              </h2>
              {ownerAssignmentRequests.length > 0 ? (
                <span className={styles.servicesCount}>
                  {ownerAssignmentRequests.length}
                </span>
              ) : null}
            </div>
          </div>

          {ownerAssignmentRequestsState === "loading" ? (
            <div className={styles.emptyState}>{t.serviceLoading}</div>
          ) : ownerAssignmentRequests.length === 0 ? (
            <div className={styles.emptyStateServices}>
              <Icon
                icon="assignment_ind"
                size={32}
                color="current"
                className={styles.emptyStateServicesIcon}
              />
              <p className={styles.emptyStateServicesText}>
                {t.assignmentOwnerRequestsEmpty}
              </p>
            </div>
          ) : (
            <DataTable<ServiceAssignmentRequest>
              rows={ownerAssignmentRequests}
              getRowId={(item) => item.assignment.id}
              tableClassName={`${styles.assignmentDataTable} ${styles.ownerRequestsTable}`}
              columns={[
                {
                  id: "service",
                  header: t.serviceTableService,
                  width: "22%",
                  render: (item) => {
                    const firstImg = item.service.images[0];
                    const imgUrl = firstImg ? proxyMediaUrl(firstImg.url) : null;

                    return (
                      <Button
                        variant="unstyled"
                        type="button"
                        className={`${styles.serviceIdentity} ${styles.serviceIdentityLink}`}
                        onClick={() => router.push(`/services?id=${item.service.id}`)}
                        aria-label={item.service.title}
                      >
                        {imgUrl ? (
                          <div className={styles.serviceThumb}>
                            <Image
                              src={imgUrl}
                              alt={item.service.title}
                              fill
                              className={styles.serviceThumbImage}
                              sizes="28px"
                            />
                          </div>
                        ) : (
                          <div className={styles.serviceThumbPlaceholder}>
                            <Icon icon="design_services" size={14} color="current" />
                          </div>
                        )}
                        <div className={styles.serviceIdentityText}>
                          <p className={styles.serviceName}>{item.service.title}</p>
                        </div>
                      </Button>
                    );
                  },
                },
                {
                  id: "member",
                  header: t.assignmentStatsMembers,
                  width: "8rem",
                  render: (item) => {
                    const memberName =
                      `${item.team_member.first_name} ${item.team_member.last_name}`.trim() ||
                      item.team_member.email;
                    const memberAvatar =
                      proxyMediaUrl(item.team_member.avatar_url) ?? "/reziphay-logo.png";

                    return (
                      <ProfileBox
                        userId={item.team_member.user_id}
                        name={memberName}
                        avatar={memberAvatar}
                        className={styles.assignmentProfileCell}
                      />
                    );
                  },
                },
                {
                  id: "branch",
                  header: t.serviceTableBranch,
                  width: "8.5rem",
                  render: (item) => (
                    <span className={styles.assignmentTextCell}>
                      {item.branch.name}
                    </span>
                  ),
                },
                {
                  id: "price",
                  header: t.serviceTablePrice,
                  width: "4.8rem",
                  align: "center",
                  render: (item) => {
                    const proposedPrice =
                      item.assignment.proposed_price ?? item.service.price;

                    return (
                      <span className={styles.servicePricePill}>
                        {proposedPrice == null ? "—" : proposedPrice}
                      </span>
                    );
                  },
                },
                {
                  id: "duration",
                  header: t.serviceTableDuration,
                  width: "6rem",
                  align: "center",
                  render: (item) => {
                    const proposedDuration =
                      item.assignment.proposed_duration ?? item.service.duration;

                    return proposedDuration ? (
                      <span className={styles.serviceDurationPill}>
                        <Icon icon="schedule" size={11} color="current" />
                        {formatServiceDuration(
                          proposedDuration,
                          t.serviceLabelDurationUnit,
                        )}
                      </span>
                    ) : (
                      <span className={styles.assignmentEmptyCell}>—</span>
                    );
                  },
                },
                {
                  id: "actions",
                  header: t.assignmentTableActions,
                  width: "8.8rem",
                  align: "right",
                  render: (item) => {
                    const busy = assignmentBusyId === item.assignment.id;

                    return (
                      <div className={styles.assignmentActions}>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() =>
                            handleOwnerAssignmentAction(item.assignment.id, "reject")
                          }
                          disabled={busy}
                        >
                          {t.assignmentOwnerReject}
                        </Button>
                        <Button
                          variant="primary"
                          size="small"
                          icon="check"
                          onClick={() =>
                            handleOwnerAssignmentAction(item.assignment.id, "approve")
                          }
                          disabled={busy}
                        >
                          {t.assignmentOwnerApprove}
                        </Button>
                      </div>
                    );
                  },
                },
              ] satisfies DataTableColumn<ServiceAssignmentRequest>[]}
            />
          )}
        </section>
      ) : null}

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
                      <div className={styles.branchNameRow}>
                        <p className={styles.branchName}>{branch.name}</p>
                        {viewerBranchId === branch.id ? (
                          <span className={styles.yourBranchBadge}>
                            {t.yourBranchBadge}
                          </span>
                        ) : null}
                      </div>
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
        open={Boolean(assignmentDraftService)}
        onOpenChange={(open) => {
          if (!open) setAssignmentDraftService(null);
        }}
      >
        <AlertDialogContent className={styles.assignmentDialogContent}>
          {assignmentDraftService ? (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>{t.assignmentModalTitle}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t.assignmentModalDescription}
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className={styles.assignmentDialogBody}>
                <div className={styles.assignmentInfoBox}>
                  <span className={styles.branchDialogLabel}>
                    {assignmentDraftService.title}
                  </span>
                  {assignmentDraftService.description?.trim() ? (
                    <RichTextDisplay
                      html={assignmentDraftService.description}
                      className={styles.branchDialogText}
                    />
                  ) : (
                    <p className={styles.branchDialogText}>—</p>
                  )}
                </div>

                <div className={styles.assignmentFormGrid}>
                  <label className={styles.assignmentField}>
                    <span className={styles.branchDialogLabel}>
                      {t.assignmentModalPrice}
                    </span>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={assignmentDraft.proposed_price}
                      onChange={(event) =>
                        setAssignmentDraft((prev) => ({
                          ...prev,
                          proposed_price: event.target.value,
                        }))
                      }
                    />
                    <span className={styles.assignmentFieldHint}>
                      {t.assignmentOwnerDefaultValue}:{" "}
                      {assignmentDraftService.price ?? "—"}
                    </span>
                  </label>

                  <label className={styles.assignmentField}>
                    <span className={styles.branchDialogLabel}>
                      {t.assignmentModalDuration}
                    </span>
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      value={assignmentDraft.proposed_duration}
                      onChange={(event) =>
                        setAssignmentDraft((prev) => ({
                          ...prev,
                          proposed_duration: event.target.value,
                        }))
                      }
                    />
                    <span className={styles.assignmentFieldHint}>
                      {t.assignmentOwnerDefaultValue}:{" "}
                      {assignmentDraftService.duration ?? "—"}
                    </span>
                  </label>
                </div>
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setAssignmentDraftService(null)}>
                  {t.deleteCancel}
                </AlertDialogCancel>
                <Button
                  variant="secondary"
                  icon="open_in_new"
                  onClick={() =>
                    window.open(
                      `/services?id=${assignmentDraftService.id}`,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                >
                  {t.assignmentModalOpenService}
                </Button>
                <Button
                  variant="primary"
                  icon="check"
                  isLoading={assignmentBusyId === assignmentDraftService.id}
                  onClick={() => handleRequestAssignment(assignmentDraftService.id)}
                >
                  {t.assignmentModalSubmit}
                </Button>
              </AlertDialogFooter>
            </>
          ) : null}
        </AlertDialogContent>
      </AlertDialog>

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

                  {selectedService.address && !selectedService.brand_id ? (
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

                    {canSelfAssignServices ? (
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
                          {isOwner ? (
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
                          ) : null}

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
              {`${t.deleteBranch}: ${deleteTarget?.item.name}`}
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
