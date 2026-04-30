"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/atoms/button";
import { Alert } from "@/components/atoms/alert";
import { OwnerCard } from "@/components/molecules/owner-card";
import { RichTextDisplay } from "@/components/molecules/rich-text-editor/rich-text-display";
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
import { proxyMediaUrl } from "@/lib/media";
import type {
  QueueItem,
  ModerationBrandDetail,
  ModerationServiceDetail,
  ChecklistItem,
} from "@/types/moderation";
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

function formatDateTime(iso?: string): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatPrice(value?: number | null, priceType?: string): string {
  if (priceType === "FREE") return "Pulsuz";
  if (typeof value !== "number") return "—";
  const prefix = priceType === "STARTING_FROM" ? "Başlayır: " : "";
  return `${prefix}${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} AZN`;
}

export function AdminModerationWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, messages } = useLocale();
  const t = messages.moderation;
  const { accessToken } = useAppSelector(selectAuthSession);
  const decisionLabel = locale === "az" ? "Qərar" : "Decision";
  const closeLabel = locale === "az" ? "Bağla" : "Close";
  const detailsLabel = locale === "az" ? "Detallar" : "Details";
  const addressLabel = locale === "az" ? "Ünvan" : "Address";
  const branchLabel = locale === "az" ? "Filial" : "Branch";
  const createdLabel = locale === "az" ? "Yaradılma" : "Created";
  const updatedLabel = locale === "az" ? "Yenilənmə" : "Updated";
  const priceLabel = locale === "az" ? "Qiymət" : "Price";
  const durationLabel = locale === "az" ? "Müddət" : "Duration";
  const noDescriptionLabel = locale === "az" ? "Təsvir yoxdur." : "No description.";
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
            <Alert variant="success">{actionFeedback}</Alert>
          </div>
        )}

        <div className={styles.tabs}>
          <button
            type="button"
            className={[styles.tab, activeTab === "brand" ? styles.tabActive : ""].join(" ")}
            onClick={() => handleTabChange("brand")}
          >
            {t.tabBrands}
          </button>
          <button
            type="button"
            className={[styles.tab, activeTab === "service" ? styles.tabActive : ""].join(" ")}
            onClick={() => handleTabChange("service")}
          >
            {t.tabServices}
          </button>
        </div>

        {queueLoading ? (
          <div className={styles.skeletonRow}>
            {[1, 2, 3].map((n) => (
              <div key={n} className={styles.skeletonLine} style={{ width: `${60 + n * 10}%` }} />
            ))}
          </div>
        ) : queueError ? (
          <Alert variant="destructive">{queueError}</Alert>
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

  const entityDescription =
    detail?.type === "brand"
      ? detail.data.description
      : detail?.type === "service"
        ? detail.data.description
        : undefined;

  const entityCategory =
    detail?.type === "brand"
      ? (() => {
          const cat = detail.data.categories?.[0];
          return cat ? (messages.categories[cat.key as keyof typeof messages.categories] ?? cat.key) : undefined;
        })()
      : detail?.type === "service"
        ? (() => {
            const cat = detail.data.service_category;
            return cat ? (messages.categories[cat.key as keyof typeof messages.categories] ?? cat.key) : undefined;
          })()
        : undefined;

  const entityOwner = detail?.data.owner;
  const serviceBranch = detail?.type === "service" ? detail.data.branch : null;
  const serviceBrand = serviceBranch?.brand ?? null;
  const brandBranches = detail?.type === "brand" ? (detail.data.branches ?? []) : [];
  const entityAddress =
    detail?.type === "service"
      ? serviceBranch
        ? [serviceBranch.address1, serviceBranch.address2].filter(Boolean).join(", ")
        : detail.data.address
      : brandBranches.map((branch) => [branch.address1, branch.address2].filter(Boolean).join(", ")).filter(Boolean).join(" • ");

  const galleryImages: string[] =
    detail?.type === "brand"
      ? (detail.data.gallery ?? []).map((g) => proxyMediaUrl(g.url) ?? g.url).filter(Boolean)
      : detail?.type === "service"
        ? (detail.data.images ?? []).map((i) => proxyMediaUrl(i.url) ?? i.url).filter(Boolean)
        : [];

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
                  <button
                    type="button"
                    key={item.key}
                    className={styles.checklistItem}
                    onClick={() => toggleChecklist(item.key)}
                  >
                    <span className={styles.checklistLabel}>{item.label}</span>
                    <span className={item.passed ? styles.checklistPassed : styles.checklistFailed}>
                      {item.passed ? t.checklistPassed : t.checklistFailed}
                    </span>
                  </button>
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
          <Alert variant={actionStatus === "success" ? "success" : "destructive"}>
            {actionFeedback}
          </Alert>
        </div>
      )}

      {detailLoading ? (
        <div className={styles.skeletonRow}>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className={styles.skeletonLine} style={{ width: `${50 + n * 10}%` }} />
          ))}
        </div>
      ) : detail ? (
        <div className={styles.reviewShell}>
          <div className={styles.reviewMain}>
            {galleryImages.length > 0 ? (
              <div className={styles.heroMedia}>
                <img src={galleryImages[0]} alt={entityTitle} className={styles.heroImage} />
                {galleryImages.length > 1 && (
                  <div className={styles.thumbnailRow}>
                    {galleryImages.slice(1).map((url, idx) => (
                      <img key={idx} src={url} alt={`${entityTitle} ${idx + 2}`} className={styles.thumbnailImage} />
                    ))}
                  </div>
                )}
              </div>
            ) : detail.type === "brand" && detail.data.logo_url ? (
              <div className={styles.logoHero}>
                <img src={detail.data.logo_url} alt={detail.data.name} className={styles.logoImg} />
              </div>
            ) : (
              <div className={styles.heroPlaceholder}>{entityTitle}</div>
            )}

            <div className={styles.detailSection}>
              <p className={styles.detailLabel}>{messages.brands.fieldDescription}</p>
              <RichTextDisplay
                html={entityDescription ?? ""}
                className={styles.detailValue}
                emptyFallback={noDescriptionLabel}
              />
            </div>

            {detail.type === "brand" && brandBranches.length > 0 && (
              <div className={styles.branchList}>
                <p className={styles.detailLabel}>{branchLabel}</p>
                {brandBranches.map((branch) => (
                  <div key={branch.id} className={styles.branchItem}>
                    <strong>{branch.name}</strong>
                    <span>{[branch.address1, branch.address2].filter(Boolean).join(", ")}</span>
                    {(branch.phone || branch.email) && (
                      <small>{[branch.phone, branch.email].filter(Boolean).join(" • ")}</small>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className={styles.reviewSidebar}>
            <div className={styles.detailCard}>
              <h2 className={styles.sidebarTitle}>{detailsLabel}</h2>
              <dl className={styles.detailDl}>
                {entityCategory && (
                  <>
                    <dt>{t.categoryLabel}</dt>
                    <dd><span className={styles.detailChip}>{entityCategory}</span></dd>
                  </>
                )}
                {detail.type === "service" && (
                  <>
                    <dt>{priceLabel}</dt>
                    <dd>{formatPrice(detail.data.price, detail.data.price_type)}</dd>
                    <dt>{durationLabel}</dt>
                    <dd>{detail.data.duration ? `${detail.data.duration} dəq` : "—"}</dd>
                  </>
                )}
                {serviceBranch && (
                  <>
                    <dt>{branchLabel}</dt>
                    <dd>{serviceBranch.name}</dd>
                  </>
                )}
                {entityAddress && (
                  <>
                    <dt>{addressLabel}</dt>
                    <dd>{entityAddress}</dd>
                  </>
                )}
                <dt>{createdLabel}</dt>
                <dd>{formatDateTime(detail.data.created_at)}</dd>
                <dt>{updatedLabel}</dt>
                <dd>{formatDateTime(detail.data.updated_at)}</dd>
              </dl>

              <div className={styles.detailOwnerCardWrap}>
                {detail.type === "service" && serviceBrand ? (
                  <OwnerCard
                    roleLabel={brandRoleLabel}
                    name={serviceBrand.name}
                    href={`/brands?id=${serviceBrand.id}`}
                    logoUrl={serviceBrand.logo_url}
                    rating={serviceBrand.rating}
                    ratingCount={serviceBrand.rating_count}
                  />
                ) : entityOwner ? (
                  <OwnerCard
                    roleLabel={providerRoleLabel}
                    name={getOwnerName(entityOwner)}
                    href={`/account?id=${entityOwner.id}`}
                    avatarUrl={entityOwner.avatar_url}
                    initials={getInitials(entityOwner)}
                    subtitle={entityOwner.email}
                  />
                ) : null}
              </div>
            </div>
            <div className={styles.detailCard}>
              <div className={styles.actionBar}>
                <Button
                  variant="primary"
                  onClick={handleDecisionClick}
                  disabled={actionStatus === "loading" || actionStatus === "success"}
                  icon="rule"
                >
                  {decisionLabel}
                </Button>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
