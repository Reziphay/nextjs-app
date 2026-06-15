"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  Button,
  Combobox,
  type ComboboxOption,
} from "@/components/atoms";
import { Calendar } from "@/components/ui/calendar";
import { Icon } from "@/components/icon";
import { useLocale } from "@/components/providers/locale-provider";
import { proxyMediaUrl } from "@/lib/media";
import { fetchAvailability, createReservation } from "@/lib/reservations-api";
import type { ServiceProvider } from "@/types/service";
import styles from "./booking-modal.module.css";

type BookingModalProps = {
  serviceId: string;
  serviceTitle: string;
  serviceDuration?: number | null;
  /** Brand-owned service → UCR must pick a branch then a provider before slots. */
  isBrandService?: boolean;
  /** Accepted providers (branch+USO pairs) for a brand service. */
  providers?: ServiceProvider[];
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
type BranchOption = { id: string; name: string };

export function BookingModal({
  serviceId,
  serviceTitle,
  serviceDuration,
  isBrandService = false,
  providers = [],
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
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);

  // Brand services require an accepted provider; direct services resolve the
  // owner server-side, so selection UI is skipped.
  const needsSelection = isBrandService && providers.length > 0;

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Unique branches that have at least one accepted provider for this service.
  const branches: BranchOption[] = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of providers) {
      if (!map.has(p.branch_id)) map.set(p.branch_id, p.branch_name);
    }
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [providers]);

  const providersInBranch = useMemo(
    () => providers.filter((p) => p.branch_id === selectedBranchId),
    [providers, selectedBranchId],
  );

  const branchItems: ComboboxOption[] = useMemo(
    () => branches.map((b) => ({ value: b.id, label: b.name })),
    [branches],
  );

  const providerItems: ComboboxOption[] = useMemo(
    () =>
      providersInBranch.map((p) => ({
        value: p.user_id,
        label: `${p.first_name} ${p.last_name}`.trim(),
      })),
    [providersInBranch],
  );

  const providerById = useMemo(
    () => new Map(providers.map((p) => [p.user_id, p])),
    [providers],
  );

  // Auto-select when there is only one branch / one provider in the branch.
  useEffect(() => {
    if (!open || !needsSelection) return;
    if (!selectedBranchId && branches.length === 1) {
      setSelectedBranchId(branches[0].id);
    }
  }, [open, needsSelection, branches, selectedBranchId]);

  useEffect(() => {
    if (!open || !needsSelection || !selectedBranchId) return;
    if (!selectedProviderId && providersInBranch.length === 1) {
      setSelectedProviderId(providersInBranch[0].user_id);
    }
  }, [open, needsSelection, selectedBranchId, selectedProviderId, providersInBranch]);

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
          {
            service_id: serviceId,
            date: toDateStr(selected),
            ...(selectedProviderId ? { provider_user_id: selectedProviderId } : {}),
          },
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
    [serviceId, accessToken, selectedProviderId, t.loadError],
  );

  const handleDateSelect = useCallback(
    (selected: Date | undefined) => {
      setDate(selected);
      // Brand services need a provider before slots resolve to that person.
      if (selected && !(isBrandService && providers.length > 0 && !selectedProviderId)) {
        void loadSlots(selected);
      } else {
        setSlots([]);
      }
    },
    [loadSlots, isBrandService, providers.length, selectedProviderId],
  );

  function resetState() {
    setDate(undefined);
    setSlots([]);
    setSelectedSlot(null);
    setSelectedBranchId(null);
    setSelectedProviderId(null);
  }

  function handleSelectBranch(branchId: string) {
    setSelectedBranchId(branchId);
    setSelectedProviderId(null);
    setDate(undefined);
    setSlots([]);
    setSelectedSlot(null);
  }

  function handleSelectProvider(userId: string) {
    setSelectedProviderId(userId);
    setDate(undefined);
    setSlots([]);
    setSelectedSlot(null);
  }

  const handleConfirm = useCallback(async () => {
    if (!selectedSlot) return;
    setBooking(true);
    setError(null);
    try {
      await createReservation(
        {
          service_id: serviceId,
          starts_at: selectedSlot,
          ...(selectedProviderId ? { provider_user_id: selectedProviderId } : {}),
          ...(selectedBranchId ? { branch_id: selectedBranchId } : {}),
        },
        accessToken,
      );
      onBooked?.();
      onOpenChange(false);
      resetState();
    } catch {
      setError(t.bookError);
    } finally {
      setBooking(false);
    }
  }, [
    selectedSlot,
    serviceId,
    accessToken,
    selectedProviderId,
    selectedBranchId,
    onBooked,
    onOpenChange,
    t.bookError,
  ]);

  const dateLabel = date
    ? new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(date)
    : "";

  // Brand services need a provider before slots can be loaded.
  const needsProvider = needsSelection && !selectedProviderId;

  // Live summary shown in the header: provider · branch · date · time · duration.
  const selectedProvider = selectedProviderId ? providerById.get(selectedProviderId) : null;
  const selectedBranchName = selectedBranchId
    ? branches.find((b) => b.id === selectedBranchId)?.name ?? null
    : null;
  const summaryParts = [
    selectedProvider ? `${selectedProvider.first_name} ${selectedProvider.last_name}`.trim() : null,
    selectedBranchName,
    date ? dateLabel : null,
    selectedSlot ? slotLabel(selectedSlot) : null,
    serviceDuration ? `${serviceDuration} ${messages.services.fieldDurationUnit}` : null,
  ].filter(Boolean);

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) resetState();
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className={styles.dialog}>
        {/* Absorb the dialog's initial autofocus so the branch Combobox doesn't
            open on mount (it opens on focus). */}
        <span
          data-alert-dialog-autofocus
          tabIndex={-1}
          aria-hidden="true"
          className={styles.focusSentinel}
        />
        <AlertDialogHeader>
          <AlertDialogTitle>{t.bookTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            <span className={styles.subtitle}>
              <span className={styles.subtitleTitle}>{serviceTitle}</span>
              {summaryParts.length ? (
                <span className={styles.summary}>({summaryParts.join(" · ")})</span>
              ) : null}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isBrandService && providers.length === 0 ? (
          <div className={styles.placeholder}>
            <Icon icon="person_off" size={28} color="current" />
            <p>{t.noProvidersTitle}</p>
            <span className={styles.noProvidersDesc}>{t.noProvidersDesc}</span>
          </div>
        ) : (
          <>
            {needsSelection ? (
              <div className={styles.selection}>
                <div className={styles.selectGroup}>
                  <span className={styles.selectLabel}>{t.selectBranch}</span>
                  <Combobox
                    items={branchItems}
                    value={selectedBranchId ?? ""}
                    placeholder={t.selectBranch}
                    emptyMessage={t.noSlots}
                    onValueChange={(value) => {
                      if (typeof value === "string") handleSelectBranch(value);
                    }}
                  />
                </div>

                {selectedBranchId ? (
                  <div className={styles.selectGroup}>
                    <span className={styles.selectLabel}>{t.selectProvider}</span>
                    <Combobox
                      items={providerItems}
                      value={selectedProviderId ?? ""}
                      placeholder={t.selectProvider}
                      emptyMessage={t.noSlots}
                      onValueChange={(value) => {
                        if (typeof value === "string") handleSelectProvider(value);
                      }}
                      renderItem={(item) => {
                        const p = providerById.get(item.value);
                        const avatar = p ? proxyMediaUrl(p.avatar_url) : null;
                        return (
                          <span className={styles.providerOption}>
                            <span
                              className={styles.providerAvatar}
                              style={avatar ? { backgroundImage: `url(${avatar})` } : undefined}
                              data-has-image={avatar ? "true" : "false"}
                            >
                              {!avatar && p
                                ? `${p.first_name[0] ?? ""}${p.last_name[0] ?? ""}`.toUpperCase()
                                : null}
                            </span>
                            {item.label}
                          </span>
                        );
                      }}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}

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
                {needsProvider ? (
                  <div className={styles.placeholder}>
                    <Icon icon="how_to_reg" size={28} color="current" />
                    <p>{t.selectProvider}</p>
                  </div>
                ) : !date ? (
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
          </>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <AlertDialogFooter>
          <Button variant="ghost" onClick={() => handleOpenChange(false)} disabled={booking}>
            {t.cancel}
          </Button>
          <Button
            variant="primary"
            icon="event_available"
            onClick={handleConfirm}
            disabled={!selectedSlot || booking}
            isLoading={booking}
          >
            {t.confirmBooking}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
