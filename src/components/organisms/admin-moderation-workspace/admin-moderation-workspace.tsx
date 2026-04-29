"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/atoms/button";
import { Alert } from "@/components/atoms/alert";
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
import styles from "./admin-moderation-workspace.module.css";

type ActiveTab = "brand" | "service";
type ViewMode = "queue" | "detail";
type ActionStatus = "idle" | "loading" | "success" | "error";

type DetailState =
  | { type: "brand"; data: ModerationBrandDetail }
  | { type: "service"; data: ModerationServiceDetail }
  | null;

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

export function AdminModerationWorkspace() {
  const { messages } = useLocale();
  const t = messages.moderation;
  const { accessToken } = useAppSelector(selectAuthSession);

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
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState<string | null>(null);

  // Approve confirm
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);

  // Action feedback
  const [actionStatus, setActionStatus] = useState<ActionStatus>("idle");
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

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

  async function handleReview(item: QueueItem) {
    if (!accessToken) return;
    setDetailLoading(true);
    setViewMode("detail");
    setDetail(null);
    setChecklist([]);
    setShowRejectForm(false);
    setRejectionReason("");
    setRejectionError(null);
    setShowApproveConfirm(false);
    setActionStatus("idle");
    setActionFeedback(null);

    try {
      if (item.type === "brand") {
        const brand = await fetchBrandForReview(item.id, accessToken);
        setDetail({ type: "brand", data: brand });
        setChecklist(brand.checklist ?? []);
      } else {
        const service = await fetchServiceForReview(item.id, accessToken);
        setDetail({ type: "service", data: service });
        setChecklist(service.checklist ?? []);
      }
    } catch {
      setActionFeedback(t.actionError);
      setActionStatus("error");
    } finally {
      setDetailLoading(false);
    }
  }

  // ── Back to queue ────────────────────────────────────────────────────────

  function handleBack() {
    setViewMode("queue");
    setDetail(null);
    setShowRejectForm(false);
    setRejectionReason("");
    setRejectionError(null);
    setShowApproveConfirm(false);
    setActionStatus("idle");
    setActionFeedback(null);
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

  // ── Approve flow ──────────────────────────────────────────────────────────

  function handleApproveClick() {
    setShowRejectForm(false);
    setShowApproveConfirm(true);
  }

  async function handleApproveConfirm() {
    setShowApproveConfirm(false);
    await handleAction("approve");
  }

  // ── Reject flow ───────────────────────────────────────────────────────────

  function handleRejectClick() {
    setShowApproveConfirm(false);
    setShowRejectForm(true);
    setRejectionReason("");
    setRejectionError(null);
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

  function renderOwnerCell(owner: QueueItem["owner"]) {
    return (
      <div>
        <div className={styles.ownerName}>
          {owner.first_name} {owner.last_name}
        </div>
        <div className={styles.ownerEmail}>{owner.email}</div>
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
            onClick={() => setActiveTab("brand")}
          >
            {t.tabBrands}
          </button>
          <button
            type="button"
            className={[styles.tab, activeTab === "service" ? styles.tabActive : ""].join(" ")}
            onClick={() => setActiveTab("service")}
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
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t.colName}</th>
                  <th>{t.colOwner}</th>
                  <th>{t.colSubmitted}</th>
                  <th className={styles.colAction}>{t.colAction}</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueue.map((item) => (
                  <tr key={item.id}>
                    <td className={styles.colName}>{item.title}</td>
                    <td>{renderOwnerCell(item.owner)}</td>
                    <td className={styles.colDate}>{formatDate(item.created_at)}</td>
                    <td className={styles.colAction}>
                      <Button
                        size="small"
                        variant="outline"
                        onClick={() => handleReview(item)}
                      >
                        {t.reviewButton}
                      </Button>
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

  const galleryImages: string[] =
    detail?.type === "brand"
      ? (detail.data.gallery ?? []).map((g) => g.url).filter(Boolean)
      : detail?.type === "service"
        ? (detail.data.images ?? []).map((i) => i.url).filter(Boolean)
        : [];

  return (
    <div className={styles.wrapper}>
      {/* Approve confirm modal */}
      {showApproveConfirm && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>{t.approveConfirmTitle}</h2>
            <p className={styles.modalDescription}>{t.approveConfirmDescription}</p>
            <div className={styles.modalActions}>
              <Button
                variant="outline"
                size="small"
                onClick={() => setShowApproveConfirm(false)}
                disabled={actionStatus === "loading"}
              >
                {messages.dashboard.cancel}
              </Button>
              <Button
                variant="primary"
                size="small"
                onClick={handleApproveConfirm}
                isLoading={actionStatus === "loading"}
              >
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
        <div className={styles.detailGrid}>
          {/* Left column: entity info */}
          <div className={styles.detailCard}>
            {/* Logo (brand only) */}
            {detail.type === "brand" && detail.data.logo_url && (
              <div className={styles.detailSection}>
                <img
                  src={detail.data.logo_url}
                  alt={detail.data.name}
                  className={styles.logoImg}
                />
              </div>
            )}

            {/* Description */}
            {entityDescription && (
              <div className={styles.detailSection}>
                <p className={styles.detailLabel}>{messages.brands.fieldDescription}</p>
                <p className={styles.detailValue}>{entityDescription}</p>
              </div>
            )}

            {/* Category */}
            {entityCategory && (
              <div className={styles.detailSection}>
                <p className={styles.detailLabel}>{t.categoryLabel}</p>
                <p className={styles.detailValue}>{entityCategory}</p>
              </div>
            )}

            {/* Owner */}
            {entityOwner && (
              <div className={styles.detailSection}>
                <p className={styles.detailLabel}>{t.ownerLabel}</p>
                <p className={[styles.detailValue, styles.detailValueStrong].join(" ")}>
                  {entityOwner.first_name} {entityOwner.last_name}
                </p>
                <p className={styles.detailValue}>{entityOwner.email}</p>
              </div>
            )}

            {/* Submitted date */}
            <div className={styles.detailSection}>
              <p className={styles.detailLabel}>{t.submittedLabel}</p>
              <p className={styles.detailValue}>{formatDate(detail.data.created_at)}</p>
            </div>

            {/* Gallery */}
            {galleryImages.length > 0 && (
              <div className={styles.detailSection}>
                <p className={styles.detailLabel}>{messages.brands.gallery}</p>
                <div className={styles.gallery}>
                  {galleryImages.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`${entityTitle} ${idx + 1}`}
                      className={styles.galleryImg}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column: checklist + actions */}
          <div>
            {/* Checklist */}
            {checklist.length > 0 && (
              <div className={styles.detailCard} style={{ marginBottom: "1rem" }}>
                <p className={styles.detailLabel}>{t.checklistTitle}</p>
                {checklist.map((item) => (
                  <div
                    key={item.key}
                    className={styles.checklistItem}
                    onClick={() => toggleChecklist(item.key)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && toggleChecklist(item.key)}
                  >
                    <span className={styles.checklistLabel}>{item.label}</span>
                    <span className={item.passed ? styles.checklistPassed : styles.checklistFailed}>
                      {item.passed ? t.checklistPassed : t.checklistFailed}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Reject form */}
            {showRejectForm && (
              <div className={styles.detailCard} style={{ marginBottom: "1rem" }}>
                <p className={styles.detailLabel}>{t.rejectConfirmTitle}</p>
                <div className={styles.rejectForm}>
                  <label>
                    <p className={styles.detailLabel} style={{ marginBottom: "0.375rem" }}>
                      {t.rejectReasonLabel}
                    </p>
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
                  </label>
                  {rejectionError && (
                    <p className={styles.rejectError}>{rejectionError}</p>
                  )}
                  <div className={styles.rejectActions}>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => setShowRejectForm(false)}
                      disabled={actionStatus === "loading"}
                    >
                      {messages.dashboard.cancel}
                    </Button>
                    <Button
                      variant="destructive"
                      size="small"
                      onClick={handleRejectConfirm}
                      isLoading={actionStatus === "loading"}
                    >
                      {t.rejectButton}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Action bar */}
            {!showRejectForm && (
              <div className={styles.actionBar}>
                <Button
                  variant="primary"
                  onClick={handleApproveClick}
                  disabled={actionStatus === "loading" || actionStatus === "success"}
                  icon="check_circle"
                >
                  {t.approveButton}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRejectClick}
                  disabled={actionStatus === "loading" || actionStatus === "success"}
                  icon="cancel"
                >
                  {t.rejectButton}
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
