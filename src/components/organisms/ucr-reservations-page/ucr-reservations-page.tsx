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
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleCancel = useCallback(async () => {
    if (!cancelTarget) return;
    setBusyId(cancelTarget.id);
    setError(null);
    try {
      const updated = await cancelReservation(cancelTarget.id, accessToken);
      setItems((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
      setCancelTarget(null);
    } catch {
      setError(t.actionError);
    } finally {
      setBusyId(null);
    }
  }, [cancelTarget, accessToken, t.actionError]);

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
                      {t.actionCancel}
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <AlertDialog open={Boolean(cancelTarget)} onOpenChange={(o) => !o && setCancelTarget(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{t.cancelConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.cancelConfirmDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="ghost" onClick={() => setCancelTarget(null)}>
              {t.cancel}
            </Button>
            <Button variant="destructive" onClick={handleCancel} isLoading={busyId !== null}>
              {t.actionCancel}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
