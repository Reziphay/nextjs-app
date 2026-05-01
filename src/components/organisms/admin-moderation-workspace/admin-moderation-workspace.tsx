"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/atoms/button";
import { OwnerCard } from "@/components/molecules/owner-card";
import { StatusBanner } from "@/components/molecules/status-banner";
import { BrandDetail } from "@/components/organisms/brand-detail";
import { ServiceReadOnlyDetailView } from "@/components/organisms/services-uso-page/services-uso-page";
import { useLocale } from "@/components/providers/locale-provider";
import { useAppSelector } from "@/store/hooks";
import { selectAuthSession } from "@/store/auth";
import {
  fetchModerationQueue,
  fetchBrandForReview,
  fetchServiceForReview,
  approveBrand,
  rejectBrand,
  approveService,
  rejectService,
} from "@/lib/moderation-api";
import type {
  QueueItem,
  ModerationBrandDetail,
  ModerationServiceDetail,
  ChecklistItem,
} from "@/types/moderation";
import type { Brand } from "@/types/brand";
import type { Service } from "@/types/service";
import type { AuthenticatedUser, PublicUserProfile } from "@/types/user_types";
import styles from "./admin-moderation-workspace.module.css";

type ActiveTab = "brand" | "service";
type ViewMode = "queue" | "detail";
type ActionStatus = "idle" | "loading" | "success" | "error";

type DetailState =
  | { type: "brand"; data: ModerationBrandDetail }
  | { type: "service"; data: ModerationServiceDetail }
  | null;

function tabToProgress(tab: ActiveTab): "brands" | "services" {
  return tab === "service" ? "services" : "brands";
}

function progressToTab(progress: string | null): ActiveTab {
  return progress === "services" ? "service" : "brand";
}

function isValidProgress(progress: string | null): progress is "brands" | "services" {
  return progress === "brands" || progress === "services";
}

function moderationHref(tab: ActiveTab, id?: string): string {
  const params = new URLSearchParams({ progress: tabToProgress(tab) });
  if (id) params.set("id", id);
  return `/moderation?${params.toString()}`;
}

function getInitials(owner: QueueItem["owner"]): string {
  return `${owner.first_name[0] ?? ""}${owner.last_name[0] ?? ""}`.toUpperCase() || "?";
}

function getOwnerName(owner: QueueItem["owner"]): string {
  return `${owner.first_name} ${owner.last_name}`.trim() || owner.email;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function mapModerationOwnerToProfile(
  owner: ModerationBrandDetail["owner"] | ModerationServiceDetail["owner"],
  fallbackDate: string,
): PublicUserProfile {
  return {
    id: owner.id,
    first_name: owner.first_name,
    last_name: owner.last_name,
    email: owner.email,
    type: owner.type === "ucr" || owner.type === "admin" ? owner.type : "uso",
    avatar_url: owner.avatar_url ?? null,
    created_at: owner.created_at ?? fallbackDate,
    updated_at: owner.created_at ?? fallbackDate,
  };
}

function mapModerationOwnerToUser(
  owner: ModerationServiceDetail["owner"],
): AuthenticatedUser {
  return {
    id: owner.id,
    first_name: owner.first_name,
    last_name: owner.last_name,
    email: owner.email,
    type: owner.type === "ucr" || owner.type === "admin" ? owner.type : "uso",
    avatar_url: owner.avatar_url ?? null,
    email_verified: true,
  };
}

function mapModerationBrandToBrand(brand: ModerationBrandDetail): Brand {
  return {
    id: brand.id,
    name: brand.name,
    description: brand.description ?? undefined,
    status: brand.status as Brand["status"],
    owner_id: brand.owner.id,
    logo_url: brand.logo_url ?? undefined,
    gallery: (brand.gallery ?? []).map((item, index) => ({
      id: `${brand.id}-gallery-${index}`,
      media_id: `${brand.id}-gallery-media-${index}`,
      url: item.url,
      order: item.order ?? index,
    })),
    branches: (brand.branches ?? []).map((branch) => ({
      id: branch.id,
      brand_id: brand.id,
      name: branch.name,
      description: branch.description ?? undefined,
      address1: branch.address1,
      address2: branch.address2 ?? undefined,
      phone: branch.phone ?? undefined,
      email: branch.email ?? undefined,
      is_24_7: Boolean(branch.is_24_7),
      opening: branch.opening ?? undefined,
      closing: branch.closing ?? undefined,
      breaks: [],
      cover_url: branch.cover_url ?? undefined,
    })),
    categories: brand.categories ?? [],
    rating: null,
    rating_count: 0,
    my_rating: null,
    created_at: brand.created_at,
    updated_at: brand.updated_at ?? brand.created_at,
  };
}

function mapServiceBrandToBrand(service: ModerationServiceDetail): Brand | null {
  const brand = service.branch?.brand;
  if (!brand || !service.branch) return null;

  return {
    id: brand.id,
    name: brand.name,
    description: undefined,
    status: "ACTIVE",
    owner_id: service.owner.id,
    logo_url: brand.logo_url ?? undefined,
    gallery: [],
    branches: [
      {
        id: service.branch.id,
        brand_id: brand.id,
        name: service.branch.name,
        address1: service.branch.address1,
        address2: service.branch.address2 ?? undefined,
        is_24_7: false,
        breaks: [],
      },
    ],
    categories: [],
    rating: brand.rating ?? null,
    rating_count: brand.rating_count ?? 0,
    my_rating: null,
    created_at: service.created_at,
    updated_at: service.updated_at ?? service.created_at,
  };
}

function mapModerationServiceToService(service: ModerationServiceDetail): Service {
  return {
    id: service.id,
    title: service.title,
    description: service.description ?? undefined,
    owner_id: service.owner.id,
    branch_id: service.branch?.id ?? null,
    service_category_id: service.service_category_id ?? service.service_category?.id ?? null,
    service_category: service.service_category ?? null,
    price: service.price ?? null,
    price_type: service.price_type === "STARTING_FROM" || service.price_type === "FREE" ? service.price_type : "FIXED",
    duration: service.duration ?? null,
    address: service.branch
      ? [service.branch.address1, service.branch.address2].filter(Boolean).join(", ")
      : (service.address ?? undefined),
    status: service.status as Service["status"],
    images: (service.images ?? []).map((item, index) => ({
      id: `${service.id}-image-${index}`,
      media_id: `${service.id}-image-media-${index}`,
      order: index,
      url: item.url,
    })),
    created_at: service.created_at,
    updated_at: service.updated_at ?? service.created_at,
  };
}

export function AdminModerationWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, messages } = useLocale();
  const t = messages.moderation;
  const { accessToken } = useAppSelector(selectAuthSession);
  const decisionLabel = locale === "az" ? "Qərar" : "Decision";
  const closeLabel = locale === "az" ? "Bağla" : "Close";
  const addressLabel = locale === "az" ? "Ünvan" : "Address";
  const brandRoleLabel = locale === "az" ? "Brend" : "Brand";
  const providerRoleLabel = "Provider";

  // Queue state
  const [activeTab, setActiveTab] = useState<ActiveTab>("brand");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [queueLoading, setQueueLoading] = useState(false);
  const [queueError, setQueueError] = useState<string | null>(null);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>("queue");
  const [detail, setDetail] = useState<DetailState>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Checklist state for current detail
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  // Reject flow
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState<string | null>(null);

  // Decision modal
  const [showDecisionModal, setShowDecisionModal] = useState(false);

  // Action feedback
  const [actionStatus, setActionStatus] = useState<ActionStatus>("idle");
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const progressParam = searchParams.get("progress");
  const detailIdParam = searchParams.get("id");

  const resetDetailState = useCallback(() => {
    setViewMode("queue");
    setDetail(null);
    setRejectionReason("");
    setRejectionError(null);
    setShowDecisionModal(false);
    setActionStatus("idle");
    setActionFeedback(null);
  }, []);

  // ── Load queue ──────────────────────────────────────────────────────────

  const loadQueue = useCallback(async () => {
    if (!accessToken) return;
    setQueueLoading(true);
    setQueueError(null);
    try {
      const items = await fetchModerationQueue(undefined, accessToken);
      setQueue(items);
    } catch {
      setQueueError(t.queueLoadError);
    } finally {
      setQueueLoading(false);
    }
  }, [accessToken, t.queueLoadError]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const filteredQueue = queue.filter((item) => item.type === activeTab);

  // ── Open review detail ───────────────────────────────────────────────────

  const openDetailByType = useCallback(async (type: ActiveTab, id: string) => {
    if (!accessToken) return;
    setDetailLoading(true);
    setViewMode("detail");
    setDetail(null);
    setChecklist([]);
    setRejectionReason("");
    setRejectionError(null);
    setShowDecisionModal(false);
    setActionStatus("idle");
    setActionFeedback(null);

    try {
      if (type === "brand") {
        const brand = await fetchBrandForReview(id, accessToken);
        setDetail({ type: "brand", data: brand });
        setChecklist(brand.checklist ?? []);
      } else {
        const service = await fetchServiceForReview(id, accessToken);
        setDetail({ type: "service", data: service });
        setChecklist(service.checklist ?? []);
      }
    } catch {
      setActionFeedback(t.actionError);
      setActionStatus("error");
    } finally {
      setDetailLoading(false);
    }
  }, [accessToken, t.actionError]);

  useEffect(() => {
    if (!isValidProgress(progressParam)) {
      router.replace(moderationHref("brand"));
      return;
    }

    const nextTab = progressToTab(progressParam);
    setActiveTab(nextTab);

    if (!detailIdParam) {
      resetDetailState();
      return;
    }

    void openDetailByType(nextTab, detailIdParam);
  }, [detailIdParam, openDetailByType, progressParam, resetDetailState, router]);

  function handleTabChange(tab: ActiveTab) {
    setActiveTab(tab);
    resetDetailState();
    router.push(moderationHref(tab));
  }

  function handleReview(item: QueueItem) {
    const nextTab = item.type === "service" ? "service" : "brand";
    setActiveTab(nextTab);
    router.push(moderationHref(nextTab, item.id));
  }

  // ── Back to queue ────────────────────────────────────────────────────────

  function handleBack() {
    resetDetailState();
    router.push(moderationHref(activeTab));
  }

  // ── Checklist toggle ─────────────────────────────────────────────────────

  function toggleChecklist(key: string) {
    setChecklist((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, passed: !item.passed } : item,
      ),
    );
  }

  // ── Shared action handler ─────────────────────────────────────────────────

  async function handleAction(action: "approve" | "reject") {
    if (!accessToken || !detail) return;

    const payload =
      action === "reject"
        ? { rejection_reason: rejectionReason, checklist: checklist.length > 0 ? checklist : undefined }
        : { checklist: checklist.length > 0 ? checklist : undefined };

    setActionStatus("loading");
    setActionFeedback(null);

    try {
      if (detail.type === "brand") {
        if (action === "approve") {
          await approveBrand(detail.data.id, payload, accessToken);
        } else {
          await rejectBrand(
            detail.data.id,
            { rejection_reason: rejectionReason, checklist: checklist.length > 0 ? checklist : undefined },
            accessToken,
          );
        }
      } else {
        if (action === "approve") {
          await approveService(detail.data.id, payload, accessToken);
        } else {
          await rejectService(
            detail.data.id,
            { rejection_reason: rejectionReason, checklist: checklist.length > 0 ? checklist : undefined },
            accessToken,
          );
        }
      }

      setActionStatus("success");
      setActionFeedback(t.actionSuccess);
      // Remove from queue and return
      setQueue((prev) => prev.filter((item) => item.id !== detail.data.id));
      setTimeout(() => {
        handleBack();
      }, 1200);
    } catch {
      setActionStatus("error");
      setActionFeedback(t.actionError);
    }
  }

  function handleDecisionClick() {
    setShowDecisionModal(true);
    setRejectionReason("");
    setRejectionError(null);
  }

  async function handleApproveConfirm() {
    setShowDecisionModal(false);
    await handleAction("approve");
  }

  async function handleRejectConfirm() {
    if (!rejectionReason || rejectionReason.trim().length < 10) {
      setRejectionError(t.rejectReasonRequired);
      return;
    }
    setRejectionError(null);
    await handleAction("reject");
  }

  // ── Render helpers ────────────────────────────────────────────────────────

  function getCategoryLabel(item: QueueItem): string {
    const category =
      item.type === "service"
        ? item.service_category
        : item.categories?.[0] ?? null;
    if (!category) return "—";
    return messages.categories[category.key as keyof typeof messages.categories] ?? category.key;
  }

  function renderOwnerCell(item: QueueItem) {
    if (item.type === "service" && item.brand) {
      return (
        <div className={styles.ownerCell}>
          <OwnerCard
            roleLabel={brandRoleLabel}
            name={item.brand.name}
            href={`/brands?id=${item.brand.id}`}
            logoUrl={item.brand.logo_url}
            rating={item.brand.rating}
            ratingCount={item.brand.rating_count}
            compact
          />
        </div>
      );
    }

    return (
      <div className={styles.ownerCell}>
        <OwnerCard
          roleLabel={providerRoleLabel}
          name={getOwnerName(item.owner)}
          href={`/account?id=${item.owner.id}`}
          avatarUrl={item.owner.avatar_url}
          initials={getInitials(item.owner)}
          subtitle={item.owner.email}
          compact
        />
      </div>
    );
  }

  // ── Queue View ────────────────────────────────────────────────────────────

  if (viewMode === "queue") {
    return (
      <div className={styles.wrapper}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>{t.pageTitle}</h1>
          <p className={styles.pageDescription}>{t.pageDescription}</p>
        </div>

        {actionFeedback && actionStatus === "success" && (
          <div className={styles.feedback}>
            <StatusBanner variant="success">{actionFeedback}</StatusBanner>
          </div>
        )}

        <div className={styles.tabs}>
          <Button
            variant="unstyled"
            type="button"
            className={[styles.tab, activeTab === "brand" ? styles.tabActive : ""].join(" ")}
            onClick={() => handleTabChange("brand")}
          >
            {t.tabBrands}
          </Button>
          <Button
            variant="unstyled"
            type="button"
            className={[styles.tab, activeTab === "service" ? styles.tabActive : ""].join(" ")}
            onClick={() => handleTabChange("service")}
          >
            {t.tabServices}
          </Button>
        </div>

        {queueLoading ? (
          <div className={styles.skeletonRow}>
            {[1, 2, 3].map((n) => (
              <div key={n} className={styles.skeletonLine} style={{ width: `${60 + n * 10}%` }} />
            ))}
          </div>
        ) : queueError ? (
          <StatusBanner variant="error">{queueError}</StatusBanner>
        ) : filteredQueue.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>{t.queueEmpty}</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table
              className={[
                styles.table,
                activeTab === "service" ? styles.tableService : styles.tableBrand,
              ].join(" ")}
            >
              <colgroup>
                <col className={styles.colOwnerWidth} />
                <col className={styles.colNameWidth} />
                <col className={styles.colCategoryWidth} />
                {activeTab === "service" && <col className={styles.colAddressWidth} />}
                <col className={styles.colDateWidth} />
                <col className={styles.colActionWidth} />
              </colgroup>
              <thead>
                <tr>
                  <th>{t.colOwner}</th>
                  <th>{t.colName}</th>
                  <th>{t.categoryLabel}</th>
                  {activeTab === "service" && <th>{addressLabel}</th>}
                  <th>{t.colSubmitted}</th>
                  <th className={styles.colAction}>{t.colAction}</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueue.map((item) => (
                  <tr key={item.id}>
                    <td>{renderOwnerCell(item)}</td>
                    <td className={styles.colName}>{item.title}</td>
                    <td className={styles.colMeta}>{getCategoryLabel(item)}</td>
                    {activeTab === "service" && (
                      <td className={styles.colAddress}>{item.address || "—"}</td>
                    )}
                    <td className={styles.colDate}>{formatDate(item.created_at)}</td>
                    <td className={styles.colAction}>
                      <div className={styles.actionCell}>
                        <Button
                          size="small"
                          variant="outline"
                          icon="visibility"
                          onClick={() => handleReview(item)}
                        >
                          {t.reviewButton}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ── Detail / Review View ──────────────────────────────────────────────────

  const entityTitle =
    detail?.type === "brand"
      ? detail.data.name
      : detail?.type === "service"
        ? detail.data.title
        : "…";

  const decisionAction = (
    <Button
      variant="primary"
      onClick={handleDecisionClick}
      disabled={actionStatus === "loading" || actionStatus === "success"}
      icon="rule"
    >
      {decisionLabel}
    </Button>
  );

  return (
    <div className={styles.wrapper}>
      {showDecisionModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>{decisionLabel}</h2>
            <p className={styles.modalDescription}>{t.approveConfirmDescription}</p>

            {checklist.length > 0 && (
              <div className={styles.modalChecklist}>
                <p className={styles.detailLabel}>{t.checklistTitle}</p>
                {checklist.map((item) => (
                  <Button
                    variant="unstyled"
                    type="button"
                    key={item.key}
                    className={styles.checklistItem}
                    onClick={() => toggleChecklist(item.key)}
                  >
                    <span className={styles.checklistLabel}>{item.label}</span>
                    <span className={item.passed ? styles.checklistPassed : styles.checklistFailed}>
                      {item.passed ? t.checklistPassed : t.checklistFailed}
                    </span>
                  </Button>
                ))}
              </div>
            )}

            <label className={styles.rejectForm}>
              <span className={styles.detailLabel}>{t.rejectReasonLabel}</span>
              <textarea
                className={styles.rejectTextarea}
                placeholder={t.rejectReasonPlaceholder}
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  if (rejectionError) setRejectionError(null);
                }}
                disabled={actionStatus === "loading"}
              />
              {rejectionError && <span className={styles.rejectError}>{rejectionError}</span>}
            </label>

            <div className={styles.modalActions}>
              <Button variant="outline" size="small" onClick={() => setShowDecisionModal(false)} disabled={actionStatus === "loading"}>
                {closeLabel}
              </Button>
              <Button variant="destructive" size="small" onClick={handleRejectConfirm} isLoading={actionStatus === "loading"}>
                {t.rejectButton}
              </Button>
              <Button variant="primary" size="small" onClick={handleApproveConfirm} isLoading={actionStatus === "loading"}>
                {t.approveButton}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Detail header */}
      <div className={styles.detailHeader}>
        <Button
          variant="ghost"
          size="small"
          icon="arrow_back"
          className={styles.backButton}
          onClick={handleBack}
        >
          {t.backToQueue}
        </Button>
        <h1 className={styles.detailTitle}>{detailLoading ? t.loadingDetail : entityTitle}</h1>
        <span className={styles.pendingBadge}>{t.statusPending}</span>
      </div>

      {actionFeedback && (
        <div className={styles.feedback}>
          <StatusBanner variant={actionStatus === "success" ? "success" : "error"}>
            {actionFeedback}
          </StatusBanner>
        </div>
      )}

      {detailLoading ? (
        <div className={styles.skeletonRow}>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className={styles.skeletonLine} style={{ width: `${50 + n * 10}%` }} />
          ))}
        </div>
      ) : detail ? (
        detail.type === "brand" ? (
          <BrandDetail
            brand={mapModerationBrandToBrand(detail.data)}
            owner={mapModerationOwnerToProfile(detail.data.owner, detail.data.created_at)}
            actionSlot={decisionAction}
          />
        ) : (
          <ServiceReadOnlyDetailView
            service={mapModerationServiceToService(detail.data)}
            brands={mapServiceBrandToBrand(detail.data) ? [mapServiceBrandToBrand(detail.data)!] : []}
            user={mapModerationOwnerToUser(detail.data.owner)}
            actionSlot={decisionAction}
            onBack={handleBack}
          />
        )
      ) : null}
    </div>
  );
}
