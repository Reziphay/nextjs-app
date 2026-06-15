"use client";

import { useCallback, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  Badge,
  Button,
} from "@/components/atoms";
import { PageSurfaceHeader } from "@/components/molecules/page-surface-header";
import { useLocale } from "@/components/providers/locale-provider";
import { cancelReservation } from "@/lib/reservations-api";
import type { Reservation, ReservationStatus } from "@/types/reservation";
import styles from "./ucr-reservations-page.module.css";

type UcrReservationsPageProps = {
  reservations: Reservation[];
  accessToken: string;
};

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const STATUS_VARIANT: Record<ReservationStatus, BadgeVariant> = {
  PENDING: "secondary",
  CONFIRMED: "default",
  CANCELLED_BY_UCR: "destructive",
  CANCELLED_BY_USO: "destructive",
  COMPLETED: "default",
  NO_SHOW: "outline",
};

function formatWhen(iso: string): string {
  // Slot ISO is wall-clock-as-UTC.
  const date = iso.slice(0, 10);
  const time = iso.slice(11, 16);
  return `${date} · ${time}`;
}

export function UcrReservationsPage({ reservations, accessToken }: UcrReservationsPageProps) {
  const { messages } = useLocale();
  const t = messages.reservations;
  const [items, setItems] = useState(reservations);
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const CANCEL_REASON_MIN = 20;
  const reasonValid = cancelReason.trim().length >= CANCEL_REASON_MIN;

  const statusLabel = useCallback(
    (s: ReservationStatus): string => {
      switch (s) {
        case "PENDING": return t.statusPending;
        case "CONFIRMED": return t.statusConfirmed;
        case "CANCELLED_BY_UCR": return t.statusCancelledByUcr;
        case "CANCELLED_BY_USO": return t.statusCancelledByUso;
        case "COMPLETED": return t.statusCompleted;
        case "NO_SHOW": return t.statusNoShow;
        default: return s;
      }
    },
    [t],
  );

  // A still-PENDING reservation is "withdrawn" with no reason; a CONFIRMED one
  // is cancelled and needs a ≥20-char reason.
  const isPendingTarget = cancelTarget?.status === "PENDING";

  const handleCancel = useCallback(async () => {
    if (!cancelTarget) return;
    if (!isPendingTarget && !reasonValid) return;
    setBusyId(cancelTarget.id);
    setError(null);
    try {
      const updated = await cancelReservation(
        cancelTarget.id,
        accessToken,
        isPendingTarget ? undefined : cancelReason.trim(),
      );
      setItems((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
      setCancelTarget(null);
      setCancelReason("");
    } catch {
      setError(t.actionError);
    } finally {
      setBusyId(null);
    }
  }, [cancelTarget, isPendingTarget, accessToken, cancelReason, reasonValid, t.actionError]);

  return (
    <div className={styles.page}>
      <PageSurfaceHeader title={t.listTitle} subtitle={t.listDescription} />

      {items.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>{t.emptyTitle}</p>
          <p className={styles.emptyDesc}>{t.emptyDescription}</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {items.map((r) => {
            const cancellable = r.status === "PENDING" || r.status === "CONFIRMED";
            return (
              <li key={r.id} className={styles.card}>
                <div className={styles.cardMain}>
                  <span className={styles.title}>{r.service?.title ?? "—"}</span>
                  <span className={styles.meta}>{formatWhen(r.starts_at)}</span>
                  {r.provider && (
                    <span className={styles.meta}>
                      {t.withProvider}: {r.provider.first_name} {r.provider.last_name}
                    </span>
                  )}
                  {r.status === "CONFIRMED" && r.confirmation_code && (
                    <span className={styles.code}>
                      {t.confirmationCodeLabel}: #{r.confirmation_code.slice(0, 3)}-{r.confirmation_code.slice(3)}
                    </span>
                  )}
                  {r.cancel_reason && (
                    <span className={styles.reason}>
                      {t.cancelReasonLabel}: {r.cancel_reason}
                    </span>
                  )}
                </div>
                <div className={styles.cardSide}>
                  <Badge variant={STATUS_VARIANT[r.status]}>{statusLabel(r.status)}</Badge>
                  {cancellable && (
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => setCancelTarget(r)}
                      isLoading={busyId === r.id}
                    >
                      {r.status === "PENDING" ? t.actionWithdraw : t.actionCancel}
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <AlertDialog open={Boolean(cancelTarget)} onOpenChange={(o) => { if (!o) { setCancelTarget(null); setCancelReason(""); } }}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isPendingTarget ? t.withdrawConfirmTitle : t.cancelConfirmTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isPendingTarget ? t.withdrawConfirmDescription : t.cancelConfirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {!isPendingTarget && (
            <div className={styles.reasonField}>
              <label className={styles.reasonLabel} htmlFor="ucr-cancel-reason">{t.cancelReasonLabel}</label>
              <textarea
                id="ucr-cancel-reason"
                className={styles.reasonTextarea}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder={t.cancelReasonPlaceholder}
                rows={3}
                maxLength={1000}
              />
              <span className={`${styles.reasonHint} ${!reasonValid && cancelReason.length > 0 ? styles.reasonHintError : ""}`}>
                {reasonValid ? `${cancelReason.trim().length}/1000` : t.cancelReasonHint}
              </span>
            </div>
          )}
          <AlertDialogFooter>
            <Button variant="ghost" onClick={() => { setCancelTarget(null); setCancelReason(""); }}>
              {t.close}
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={!isPendingTarget && !reasonValid}
              isLoading={busyId !== null}
            >
              {isPendingTarget ? t.actionWithdraw : t.actionCancel}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
