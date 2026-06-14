"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/atoms";
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
                  onClick={() => act(r.id, () => rejectReservation(r.id, accessToken))}
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
    </div>
  );
}
