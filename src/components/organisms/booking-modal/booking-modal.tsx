"use client";

import { useCallback, useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  Button,
} from "@/components/atoms";
import { Calendar } from "@/components/ui/calendar";
import { Icon } from "@/components/icon";
import { useLocale } from "@/components/providers/locale-provider";
import { fetchAvailability, createReservation } from "@/lib/reservations-api";
import styles from "./booking-modal.module.css";

type BookingModalProps = {
  serviceId: string;
  serviceTitle: string;
  serviceDuration?: number | null;
  accessToken: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBooked?: () => void;
};

/** Local YYYY-MM-DD for a Date (wall-clock). */
function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Slot ISO is wall-clock-as-UTC, so HH:MM lives at chars 11-16. */
function slotLabel(iso: string): string {
  return iso.slice(11, 16);
}

function slotHour(iso: string): number {
  return Number(iso.slice(11, 13));
}

type Group = { key: "morning" | "afternoon" | "evening"; label: string; slots: string[] };

export function BookingModal({
  serviceId,
  serviceTitle,
  serviceDuration,
  accessToken,
  open,
  onOpenChange,
  onBooked,
}: BookingModalProps) {
  const { messages, locale } = useLocale();
  const t = messages.reservations;

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const groups: Group[] = useMemo(() => {
    const g: Group[] = [
      { key: "morning", label: t.morning, slots: [] },
      { key: "afternoon", label: t.afternoon, slots: [] },
      { key: "evening", label: t.evening, slots: [] },
    ];
    for (const s of slots) {
      const h = slotHour(s);
      if (h < 12) g[0].slots.push(s);
      else if (h < 17) g[1].slots.push(s);
      else g[2].slots.push(s);
    }
    return g.filter((grp) => grp.slots.length > 0);
  }, [slots, t.morning, t.afternoon, t.evening]);

  const loadSlots = useCallback(
    async (selected: Date) => {
      setLoadingSlots(true);
      setError(null);
      setSelectedSlot(null);
      try {
        const result = await fetchAvailability(
          { service_id: serviceId, date: toDateStr(selected) },
          accessToken,
        );
        const merged = new Set<string>();
        for (const p of result.providers) for (const s of p.slots) merged.add(s.starts_at);
        setSlots([...merged].sort());
      } catch {
        setError(t.loadError);
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    },
    [serviceId, accessToken, t.loadError],
  );

  const handleDateSelect = useCallback(
    (selected: Date | undefined) => {
      setDate(selected);
      if (selected) void loadSlots(selected);
      else setSlots([]);
    },
    [loadSlots],
  );

  const handleConfirm = useCallback(async () => {
    if (!selectedSlot) return;
    setBooking(true);
    setError(null);
    try {
      await createReservation({ service_id: serviceId, starts_at: selectedSlot }, accessToken);
      onBooked?.();
      onOpenChange(false);
      setDate(undefined);
      setSlots([]);
      setSelectedSlot(null);
    } catch {
      setError(t.bookError);
    } finally {
      setBooking(false);
    }
  }, [selectedSlot, serviceId, accessToken, onBooked, onOpenChange, t.bookError]);

  const dateLabel = date
    ? new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(date)
    : "";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={styles.dialog}>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.bookTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            <span className={styles.subtitle}>
              {serviceTitle}
              {serviceDuration ? (
                <span className={styles.metaChip}>
                  <Icon icon="schedule" size={13} color="current" />
                  {serviceDuration} {messages.services.fieldDurationUnit}
                </span>
              ) : null}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className={styles.layout}>
          <div className={styles.calendarPane}>
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              disabled={{ before: today }}
              className={styles.calendar}
            />
          </div>

          <div className={styles.slotsPane}>
            {!date ? (
              <div className={styles.placeholder}>
                <Icon icon="event" size={28} color="current" />
                <p>{t.pickDate}</p>
              </div>
            ) : loadingSlots ? (
              <div className={styles.placeholder}>
                <span className={styles.spinner} aria-hidden />
                <p>{t.loadingSlots}</p>
              </div>
            ) : slots.length === 0 ? (
              <div className={styles.placeholder}>
                <Icon icon="event_busy" size={28} color="current" />
                <p>{t.noSlots}</p>
              </div>
            ) : (
              <>
                <div className={styles.slotsHead}>
                  <span className={styles.slotsDate}>{dateLabel}</span>
                  <span className={styles.slotsCount}>
                    {slots.length} {t.slotsCount}
                  </span>
                </div>
                <div className={styles.groups}>
                  {groups.map((grp) => (
                    <div key={grp.key} className={styles.group}>
                      <span className={styles.groupLabel}>{grp.label}</span>
                      <div className={styles.slotGrid}>
                        {grp.slots.map((s) => (
                          <button
                            key={s}
                            type="button"
                            className={`${styles.slot} ${selectedSlot === s ? styles.slotActive : ""}`}
                            onClick={() => setSelectedSlot(s)}
                          >
                            {slotLabel(s)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <AlertDialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={booking}>
            {t.cancel}
          </Button>
          <Button
            variant="primary"
            icon="event_available"
            onClick={handleConfirm}
            disabled={!selectedSlot || booking}
            isLoading={booking}
          >
            {selectedSlot ? `${t.confirmBooking} · ${slotLabel(selectedSlot)}` : t.confirmBooking}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
