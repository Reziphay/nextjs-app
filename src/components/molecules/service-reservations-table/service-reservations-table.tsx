"use client";

import { Badge } from "@/components/atoms";
import { useLocale } from "@/components/providers/locale-provider";
import type { Reservation, ReservationStatus } from "@/types/reservation";
import styles from "./service-reservations-table.module.css";

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
  reservations: Reservation[];
  // "provider" shows the customer column; "customer" shows the provider column.
  mode: "provider" | "customer";
};

export function ServiceReservationsTable({ reservations, mode }: Props) {
  const { messages } = useLocale();
  const t = messages.reservations;
  const c = messages.calendar;
  const isProvider = mode === "provider";

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

  return (
    <section className={styles.wrap}>
      <h3 className={styles.title}>{t.pageReservationsTitle}</h3>
      {reservations.length === 0 ? (
        <p className={styles.empty}>{t.pageNoReservations}</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t.colDate}</th>
                <th>{t.colTime}</th>
                <th>{isProvider ? t.colCustomer : t.withProvider}</th>
                <th>{t.colStatus}</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => {
                const party = isProvider ? r.ucr : r.provider;
                return (
                  <tr key={r.id}>
                    <td>{r.starts_at.slice(0, 10)}</td>
                    <td className={styles.mono}>
                      {r.starts_at.slice(11, 16)}–{r.ends_at.slice(11, 16)}
                    </td>
                    <td>{party ? `${party.first_name} ${party.last_name}` : "—"}</td>
                    <td>
                      <Badge variant={STATUS_VARIANT[r.status]}>{statusLabel(r.status)}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
