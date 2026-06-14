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
import { useLocale } from "@/components/providers/locale-provider";
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

type Props = {
  reservation: Reservation;
  accessToken: string;
  mode?: "provider" | "customer";
  onUpdated: (r: Reservation) => void;
  onClose: () => void;
};

export function ReservationDetailPopup({ reservation, accessToken, mode = "provider", onUpdated, onClose }: Props) {
  const { messages } = useLocale();
  const t = messages.reservations;
  const c = messages.calendar;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (fn: () => Promise<Reservation>) => {
      setBusy(true);
      setError(null);
      try {
        onUpdated(await fn());
      } catch {
        setError(t.actionError);
        setBusy(false);
      }
    },
    [onUpdated, t.actionError],
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
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <AlertDialogFooter>
          {isProvider ? (
            <>
              {reservation.status === "PENDING" && (
                <>
                  <Button variant="destructive" onClick={() => run(() => rejectReservation(reservation.id, accessToken))} disabled={busy}>
                    {t.actionReject}
                  </Button>
                  <Button variant="primary" onClick={() => run(() => confirmReservation(reservation.id, accessToken))} isLoading={busy}>
                    {t.actionConfirm}
                  </Button>
                </>
              )}
              {reservation.status === "CONFIRMED" && (
                <>
                  <Button variant="ghost" onClick={() => run(() => markNoShow(reservation.id, accessToken))} disabled={busy}>
                    {t.actionNoShow}
                  </Button>
                  <Button variant="destructive" onClick={() => run(() => rejectReservation(reservation.id, accessToken))} disabled={busy}>
                    {t.actionCancel}
                  </Button>
                  <Button variant="primary" onClick={() => run(() => completeReservation(reservation.id, accessToken))} isLoading={busy}>
                    {t.actionComplete}
                  </Button>
                </>
              )}
              {reservation.status !== "PENDING" && reservation.status !== "CONFIRMED" && (
                <Button variant="ghost" onClick={onClose}>{t.cancel}</Button>
              )}
            </>
          ) : (
            <>
              {reservation.status === "PENDING" || reservation.status === "CONFIRMED" ? (
                <>
                  <Button variant="ghost" onClick={onClose} disabled={busy}>{t.cancel}</Button>
                  <Button variant="destructive" onClick={() => run(() => cancelReservation(reservation.id, accessToken))} isLoading={busy}>
                    {t.actionCancel}
                  </Button>
                </>
              ) : (
                <Button variant="ghost" onClick={onClose}>{t.cancel}</Button>
              )}
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
