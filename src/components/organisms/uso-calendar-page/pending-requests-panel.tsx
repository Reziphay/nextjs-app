"use client";

import { useCallback, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  Button,
} from "@/components/atoms";
import { Icon } from "@/components/icon";
import { useLocale } from "@/components/providers/locale-provider";
import { confirmReservation, rejectReservation } from "@/lib/reservations-api";
import type { Reservation } from "@/types/reservation";
import styles from "./pending-requests-panel.module.css";

type Props = {
  reservations: Reservation[];
  accessToken: string;
  onUpdated: (r: Reservation) => void;
  onJump: (d: Date) => void;
};

export function PendingRequestsPanel({ reservations, accessToken, onUpdated, onJump }: Props) {
  const { messages } = useLocale();
  const t = messages.calendar;
  const rt = messages.reservations;
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Reservation | null>(null);
  const [reason, setReason] = useState("");
  const reasonValid = reason.trim().length >= 20;

  const pending = reservations.filter((r) => r.status === "PENDING");

  const act = useCallback(
    async (id: string, fn: () => Promise<Reservation>) => {
      setBusyId(id);
      setError(null);
      try {
        onUpdated(await fn());
      } catch {
        setError(t.requestsActionError);
      } finally {
        setBusyId(null);
      }
    },
    [onUpdated, t.requestsActionError],
  );

  if (pending.length === 0) return null;

  return (
    <div className={styles.panel}>
      <div className={styles.head}>
        <Icon icon="event_upcoming" size={16} color="current" />
        <span className={styles.title}>{t.requestsTitle}</span>
        <span className={styles.badge}>{pending.length}</span>
      </div>

      <ul className={styles.list}>
        {pending.map((r) => {
          const when = `${r.starts_at.slice(0, 10)} · ${r.starts_at.slice(11, 16)}`;
          const customer = r.ucr ? `${r.ucr.first_name} ${r.ucr.last_name}` : "—";
          return (
            <li key={r.id} className={styles.row}>
              <button
                type="button"
                className={styles.info}
                onClick={() => onJump(new Date(`${r.starts_at.slice(0, 10)}T00:00:00`))}
              >
                <span className={styles.svc}>{r.service?.title ?? "—"}</span>
                <span className={styles.meta}>
                  {when} · {customer}
                </span>
              </button>
              <div className={styles.actions}>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => { setRejectTarget(r); setReason(""); }}
                  disabled={busyId === r.id}
                >
                  {rt.actionReject}
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => act(r.id, () => confirmReservation(r.id, accessToken))}
                  isLoading={busyId === r.id}
                >
                  {rt.actionConfirm}
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
      {error && <p className={styles.error}>{error}</p>}

      <AlertDialog open={Boolean(rejectTarget)} onOpenChange={(o) => { if (!o) { setRejectTarget(null); setReason(""); } }}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{rt.cancelConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{rt.cancelConfirmDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className={styles.reasonField}>
            <label className={styles.reasonLabel} htmlFor="pending-reject-reason">{rt.cancelReasonLabel}</label>
            <textarea
              id="pending-reject-reason"
              className={styles.reasonTextarea}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={rt.cancelReasonPlaceholder}
              rows={3}
              maxLength={1000}
            />
            <span className={`${styles.reasonHint} ${!reasonValid && reason.length > 0 ? styles.reasonHintError : ""}`}>
              {reasonValid ? `${reason.trim().length}/1000` : rt.cancelReasonHint}
            </span>
          </div>
          <AlertDialogFooter>
            <Button variant="ghost" onClick={() => { setRejectTarget(null); setReason(""); }}>
              {rt.close}
            </Button>
            <Button
              variant="destructive"
              disabled={!reasonValid || busyId !== null}
              isLoading={busyId !== null}
              onClick={() => {
                const target = rejectTarget;
                if (!target) return;
                void act(target.id, () => rejectReservation(target.id, accessToken, reason.trim()));
                setRejectTarget(null);
                setReason("");
              }}
            >
              {rt.actionCancel}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
