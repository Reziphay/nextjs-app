"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
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
import { isAxiosError } from "axios";
import { Icon } from "@/components/icon";
import { useLocale } from "@/components/providers/locale-provider";
import { translateBackendErrorMessage } from "@/lib/backend-errors";
import {
  confirmReservation,
  rejectReservation,
  completeReservation,
  markNoShow,
  cancelReservation,
} from "@/lib/reservations-api";
import type { Reservation, ReservationStatus } from "@/types/reservation";
import styles from "./reservation-detail-popup.module.css";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const STATUS_VARIANT: Record<ReservationStatus, BadgeVariant> = {
  PENDING: "secondary",
  CONFIRMED: "default",
  CANCELLED_BY_UCR: "destructive",
  CANCELLED_BY_USO: "destructive",
  COMPLETED: "default",
  NO_SHOW: "outline",
};

function formatCode(code: string): string {
  return `#${code.slice(0, 3)}-${code.slice(3)}`;
}

type Props = {
  reservation: Reservation;
  accessToken: string;
  mode?: "provider" | "customer";
  onUpdated: (r: Reservation) => void;
  onClose: () => void;
};

export function ReservationDetailPopup({ reservation, accessToken, mode = "provider", onUpdated, onClose }: Props) {
  const { messages } = useLocale();
  const router = useRouter();
  const t = messages.reservations;
  const c = messages.calendar;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Cancel/reject requires a reason of at least 20 chars (shown to the counterparty).
  const [cancelMode, setCancelMode] = useState<null | "reject" | "cancel">(null);
  const [reason, setReason] = useState("");
  const reasonValid = reason.trim().length >= 20;
  // Completing requires the UCR's 6-digit confirmation code (anti-fraud).
  const [completeMode, setCompleteMode] = useState(false);
  const [code, setCode] = useState("");
  const codeValid = /^\d{6}$/.test(code);

  const run = useCallback(
    async (fn: () => Promise<Reservation>) => {
      setBusy(true);
      setError(null);
      try {
        onUpdated(await fn());
      } catch (err) {
        const apiMessage = isAxiosError(err)
          ? (err.response?.data as { message?: string } | undefined)?.message
          : undefined;
        setError(translateBackendErrorMessage(apiMessage, messages.backendErrors) ?? t.actionError);
        setBusy(false);
      }
    },
    [onUpdated, messages.backendErrors, t.actionError],
  );

  const statusLabel = (s: ReservationStatus): string => {
    switch (s) {
      case "PENDING": return t.statusPending;
      case "CONFIRMED": return t.statusConfirmed;
      case "CANCELLED_BY_UCR": return t.statusCancelledByUcr;
      case "CANCELLED_BY_USO": return t.statusCancelledByUso;
      case "COMPLETED": return t.statusCompleted;
      case "NO_SHOW": return t.statusNoShow;
      default: return s;
    }
  };

  const when = `${reservation.starts_at.slice(0, 10)} · ${reservation.starts_at.slice(11, 16)}–${reservation.ends_at.slice(11, 16)}`;
  const isProvider = mode === "provider";
  // No-show is only offered once the slot's start time has arrived/passed.
  // Slots are stored wall-clock-as-UTC, so compare "now" the same way.
  const now = new Date();
  const nowWallMs = Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
  );
  const hasStarted = nowWallMs >= new Date(reservation.starts_at).getTime();
  const partyLabel = isProvider ? c.detailCustomer : t.withProvider;
  const party = isProvider ? reservation.ucr : reservation.provider;
  const partyName = party ? `${party.first_name} ${party.last_name}` : "—";

  return (
    <AlertDialog open onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{c.detailTitle}</AlertDialogTitle>
          <AlertDialogDescription>{reservation.service?.title ?? c.detailService}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className={styles.rows}>
          <div className={styles.row}>
            <span className={styles.label}>{c.detailTime}</span>
            <span className={styles.value}>{when}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>{partyLabel}</span>
            <span className={styles.value}>{partyName}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>{messages.services.tableStatus}</span>
            <Badge variant={STATUS_VARIANT[reservation.status]}>{statusLabel(reservation.status)}</Badge>
          </div>

          {!isProvider && reservation.confirmation_code ? (
            <div className={styles.row}>
              <span className={styles.label}>{t.confirmationCodeLabel}</span>
              <span className={styles.code}>{formatCode(reservation.confirmation_code)}</span>
            </div>
          ) : null}

          {reservation.cancel_reason ? (
            <div className={styles.row}>
              <span className={styles.label}>{t.cancelReasonLabel}</span>
              <span className={styles.value}>{reservation.cancel_reason}</span>
            </div>
          ) : null}

          <button
            type="button"
            className={styles.serviceLink}
            onClick={() => router.push(`/services?id=${reservation.service_id}`)}
          >
            {t.viewService}
            <Icon icon="arrow_forward" size={14} color="current" />
          </button>
        </div>

        {cancelMode ? (
          <div className={styles.reasonField}>
            <label className={styles.reasonLabel} htmlFor="resv-cancel-reason">{t.cancelReasonLabel}</label>
            <textarea
              id="resv-cancel-reason"
              className={styles.reasonTextarea}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t.cancelReasonPlaceholder}
              rows={3}
              maxLength={1000}
            />
            <span className={`${styles.reasonHint} ${!reasonValid && reason.length > 0 ? styles.reasonHintError : ""}`}>
              {reasonValid ? `${reason.trim().length}/1000` : t.cancelReasonHint}
            </span>
          </div>
        ) : null}

        {completeMode ? (
          <div className={styles.reasonField}>
            <label className={styles.reasonLabel} htmlFor="resv-complete-code">{t.confirmationCodeLabel}</label>
            <input
              id="resv-complete-code"
              className={styles.codeInput}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              inputMode="numeric"
              maxLength={6}
            />
            <span className={styles.reasonHint}>{t.confirmationCodeHint}</span>
          </div>
        ) : null}

        {error && <p className={styles.error}>{error}</p>}

        <AlertDialogFooter>
          {completeMode ? (
            <>
              <Button variant="ghost" onClick={() => { setCompleteMode(false); setCode(""); }} disabled={busy}>
                {t.close}
              </Button>
              <Button
                variant="primary"
                disabled={!codeValid || busy}
                isLoading={busy}
                onClick={() => run(() => completeReservation(reservation.id, accessToken, code))}
              >
                {t.actionComplete}
              </Button>
            </>
          ) : cancelMode ? (
            <>
              <Button variant="ghost" onClick={() => { setCancelMode(null); setReason(""); }} disabled={busy}>
                {t.close}
              </Button>
              <Button
                variant="destructive"
                disabled={!reasonValid || busy}
                isLoading={busy}
                onClick={() =>
                  run(() =>
                    cancelMode === "reject"
                      ? rejectReservation(reservation.id, accessToken, reason.trim())
                      : cancelReservation(reservation.id, accessToken, reason.trim()),
                  )
                }
              >
                {t.actionCancel}
              </Button>
            </>
          ) : isProvider ? (
            <>
              {reservation.status === "PENDING" && (
                <>
                  <Button variant="destructive" onClick={() => setCancelMode("reject")} disabled={busy}>
                    {t.actionReject}
                  </Button>
                  <Button variant="primary" onClick={() => run(() => confirmReservation(reservation.id, accessToken))} isLoading={busy}>
                    {t.actionConfirm}
                  </Button>
                </>
              )}
              {reservation.status === "CONFIRMED" && (
                <>
                  {hasStarted && (
                    <Button variant="ghost" onClick={() => run(() => markNoShow(reservation.id, accessToken))} disabled={busy}>
                      {t.actionNoShow}
                    </Button>
                  )}
                  <Button variant="destructive" onClick={() => setCancelMode("reject")} disabled={busy}>
                    {t.actionCancel}
                  </Button>
                  <Button variant="primary" onClick={() => setCompleteMode(true)} disabled={busy}>
                    {t.actionComplete}
                  </Button>
                </>
              )}
              {reservation.status !== "PENDING" && reservation.status !== "CONFIRMED" && (
                <Button variant="ghost" onClick={onClose}>{t.close}</Button>
              )}
            </>
          ) : (
            <>
              {reservation.status === "PENDING" ? (
                <>
                  <Button variant="ghost" onClick={onClose} disabled={busy}>{t.close}</Button>
                  <Button
                    variant="destructive"
                    onClick={() => run(() => cancelReservation(reservation.id, accessToken))}
                    isLoading={busy}
                  >
                    {t.actionWithdraw}
                  </Button>
                </>
              ) : reservation.status === "CONFIRMED" ? (
                <>
                  <Button variant="ghost" onClick={onClose} disabled={busy}>{t.close}</Button>
                  <Button variant="destructive" onClick={() => setCancelMode("cancel")} disabled={busy}>
                    {t.actionCancel}
                  </Button>
                </>
              ) : (
                <Button variant="ghost" onClick={onClose}>{t.close}</Button>
              )}
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
