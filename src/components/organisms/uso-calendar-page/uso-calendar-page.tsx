"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/atoms/button";
import { Checkbox } from "@/components/atoms/checkbox";
import { Icon } from "@/components/icon";
import { useLocale } from "@/components/providers/locale-provider";
import type { Service } from "@/types/service";
import type { Brand } from "@/types/brand";
import type { Reservation, ReservationStatus } from "@/types/reservation";
import { AvailabilityModal } from "./availability-modal";
import { ReservationDetailPopup } from "./reservation-detail-popup";
import { PendingRequestsPanel } from "./pending-requests-panel";
import styles from "./uso-calendar-page.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type CalendarView = "day" | "work_week" | "week" | "month";

type CalendarService = {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
};

type CalendarBrand = {
  id: string;
  name: string;
};

type CalendarEvent = {
  reservation: Reservation;
  dayKey: string; // YYYY-MM-DD (wall-clock)
  startMin: number;
  endMin: number;
  color: string;
  title: string;
};

// Reservation timestamps are stored wall-clock-as-UTC (see availability.service).
function minutesFromIso(iso: string): number {
  const h = Number(iso.slice(11, 13));
  const m = Number(iso.slice(14, 16));
  return h * 60 + m;
}

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const ACTIVE_EVENT_STATUSES: ReservationStatus[] = ["PENDING", "CONFIRMED", "COMPLETED", "NO_SHOW"];

// ─── Color Palette ────────────────────────────────────────────────────────────

const SERVICE_COLORS = [
  "#4f8ef7",
  "#34c98a",
  "#f7874f",
  "#a855f7",
  "#f7c34f",
  "#ef4444",
  "#06b6d4",
  "#84cc16",
  "#f43f5e",
  "#8b5cf6",
];

function assignServiceColor(index: number): string {
  return SERVICE_COLORS[index % SERVICE_COLORS.length];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const HOURS = Array.from({ length: 24 }, (_, i) => i);

// Jan 7 2024 = Sunday — anchor for computing day-of-week names
const WEEK_ANCHOR = new Date(2024, 0, 7);

function getIntlDayNarrows(locale: string): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(WEEK_ANCHOR);
    d.setDate(WEEK_ANCHOR.getDate() + i);
    return new Intl.DateTimeFormat(locale, { weekday: "narrow" }).format(d);
  });
}

function getIntlDayShorts(locale: string): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(WEEK_ANCHOR);
    d.setDate(WEEK_ANCHOR.getDate() + i);
    return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(d);
  });
}

function getMonthName(date: Date, locale: string, fmt: "long" | "short"): string {
  return new Intl.DateTimeFormat(locale, { month: fmt }).format(date);
}

function startOfWeek(date: Date, firstDay = 0): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day - firstDay + 7) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateLabel(date: Date, view: CalendarView, locale: string): string {
  const y = date.getFullYear();
  if (view === "day") {
    return `${getMonthName(date, locale, "long")} ${date.getDate()}, ${y}`;
  }
  if (view === "month") {
    return `${getMonthName(date, locale, "long")} ${y}`;
  }
  const weekStart = startOfWeek(date, view === "work_week" ? 1 : 0);
  const weekEnd = addDays(weekStart, view === "work_week" ? 4 : 6);
  if (weekStart.getMonth() === weekEnd.getMonth()) {
    return `${getMonthName(weekStart, locale, "long")} ${y}`;
  }
  if (weekStart.getFullYear() !== weekEnd.getFullYear()) {
    return `${getMonthName(weekStart, locale, "short")} ${weekStart.getFullYear()} – ${getMonthName(weekEnd, locale, "short")} ${weekEnd.getFullYear()}`;
  }
  return `${getMonthName(weekStart, locale, "short")} – ${getMonthName(weekEnd, locale, "short")} ${y}`;
}

function navigateDate(date: Date, view: CalendarView, direction: -1 | 1): Date {
  const d = new Date(date);
  if (view === "day") d.setDate(d.getDate() + direction);
  else if (view === "month") d.setMonth(d.getMonth() + direction);
  else {
    const days = view === "work_week" ? 5 : 7;
    d.setDate(d.getDate() + direction * days);
  }
  return d;
}

function getDaysInView(date: Date, view: CalendarView): Date[] {
  if (view === "day") return [date];
  if (view === "work_week") {
    const s = startOfWeek(date, 1);
    return Array.from({ length: 5 }, (_, i) => addDays(s, i));
  }
  const s = startOfWeek(date, 0);
  return Array.from({ length: 7 }, (_, i) => addDays(s, i));
}

// ─── MiniCalendar ─────────────────────────────────────────────────────────────

type MiniCalendarProps = {
  selected: Date;
  today: Date;
  locale: string;
  previousMonthLabel: string;
  nextMonthLabel: string;
  onSelect: (d: Date) => void;
};

function MiniCalendar({
  selected,
  today,
  locale,
  previousMonthLabel,
  nextMonthLabel,
  onSelect,
}: MiniCalendarProps) {
  const dayNarrows = useMemo(() => getIntlDayNarrows(locale), [locale]);
  const [viewing, setViewing] = useState(() => {
    const d = new Date(selected);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  useEffect(() => {
    if (
      selected.getMonth() !== viewing.getMonth() ||
      selected.getFullYear() !== viewing.getFullYear()
    ) {
      const d = new Date(selected);
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      queueMicrotask(() => setViewing(d));
    }
  }, [selected, viewing]);

  const prevMonth = () =>
    setViewing((v) => {
      const d = new Date(v);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  const nextMonth = () =>
    setViewing((v) => {
      const d = new Date(v);
      d.setMonth(d.getMonth() + 1);
      return d;
    });

  const year = viewing.getFullYear();
  const month = viewing.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<Date | null> = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className={styles.miniCalendar}>
      <div className={styles.miniCalHeader}>
        <span className={styles.miniCalMonth}>
          {getMonthName(viewing, locale, "short")} {year}
        </span>
        <div className={styles.miniCalNav}>
          <Button variant="unstyled" className={styles.miniCalBtn} onClick={prevMonth} aria-label={previousMonthLabel}>
            <Icon icon="chevron_left" size={14} color="current" />
          </Button>
          <Button variant="unstyled" className={styles.miniCalBtn} onClick={nextMonth} aria-label={nextMonthLabel}>
            <Icon icon="chevron_right" size={14} color="current" />
          </Button>
        </div>
      </div>
      <div className={styles.miniCalGrid}>
        {dayNarrows.map((d, i) => (
          <span key={i} className={styles.miniCalDayLabel}>
            {d}
          </span>
        ))}
        {cells.map((date, i) => {
          if (!date) return <span key={`empty-${i}`} />;
          const isToday = isSameDay(date, today);
          const isSelected = isSameDay(date, selected);
          return (
            <Button
              variant="unstyled"
              key={date.toISOString()}
              className={[
                styles.miniCalCell,
                isToday ? styles.miniCalToday : "",
                isSelected && !isToday ? styles.miniCalSelected : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onSelect(date)}
            >
              {date.getDate()}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

// ─── CalendarSidebar ──────────────────────────────────────────────────────────

type CalendarSidebarProps = {
  open: boolean;
  selected: Date;
  today: Date;
  locale: string;
  services: CalendarService[];
  showServices: boolean;
  myServicesLabel: string;
  noServicesLabel: string;
  previousMonthLabel: string;
  nextMonthLabel: string;
  closeSidebarLabel: string;
  onDateSelect: (d: Date) => void;
  onServiceToggle: (id: string) => void;
  onClose: () => void;
};

function CalendarSidebar({
  open,
  selected,
  today,
  locale,
  services,
  showServices,
  myServicesLabel,
  noServicesLabel,
  previousMonthLabel,
  nextMonthLabel,
  closeSidebarLabel,
  onDateSelect,
  onServiceToggle,
  onClose,
}: CalendarSidebarProps) {
  return (
    <aside
      className={[styles.sidebar, open ? styles.sidebarOpen : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.sidebarInner}>
        <Button
          variant="unstyled"
          className={styles.sidebarCloseBtn}
          onClick={onClose}
          aria-label={closeSidebarLabel}
        >
          <Icon icon="close" size={18} color="current" />
        </Button>
        <MiniCalendar
          selected={selected}
          today={today}
          locale={locale}
          previousMonthLabel={previousMonthLabel}
          nextMonthLabel={nextMonthLabel}
          onSelect={onDateSelect}
        />

        {showServices && services.length > 0 && (
          <div className={styles.myServices}>
            <p className={styles.myServicesTitle}>{myServicesLabel}</p>
            <ul className={styles.myServicesList}>
              {services.map((s) => (
                <li key={s.id} className={styles.myServicesItem}>
                  <label className={styles.myServicesLabel}>
                    <Checkbox
                      checked={s.enabled}
                      onChange={() => onServiceToggle(s.id)}
                      style={{ accentColor: s.color }}
                    />
                    <span
                      className={styles.myServicesDot}
                      style={{ background: s.color }}
                    />
                    <span className={styles.myServicesName}>{s.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}

        {showServices && services.length === 0 && (
          <div className={styles.myServices}>
            <p className={styles.myServicesTitle}>{myServicesLabel}</p>
            <p className={styles.myServicesEmpty}>{noServicesLabel}</p>
          </div>
        )}
      </div>
    </aside>
  );
}

// ─── ViewSwitcherDropdown ─────────────────────────────────────────────────────

type ViewSwitcherProps = {
  view: CalendarView;
  labels: Record<CalendarView, string>;
  onChange: (v: CalendarView) => void;
};

function ViewSwitcherDropdown({ view, labels, onChange }: ViewSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className={styles.dropdownWrap} ref={ref}>
      <Button variant="unstyled" className={styles.viewSwitcherBtn} onClick={() => setOpen((o) => !o)}>
        {labels[view]}
        <Icon icon="expand_more" size={14} color="current" />
      </Button>
      {open && (
        <div className={styles.dropdownMenu}>
          {(["day", "work_week", "week", "month"] as CalendarView[]).map((v) => (
            <Button
              variant="unstyled"
              key={v}
              className={[
                styles.dropdownItem,
                view === v ? styles.dropdownItemActive : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => {
                onChange(v);
                setOpen(false);
              }}
            >
              {labels[v]}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── BrandPickerDropdown ──────────────────────────────────────────────────────

type BrandPickerProps = {
  brands: CalendarBrand[];
  selectedId: string;
  onChange: (id: string) => void;
};

function BrandPickerDropdown({ brands, selectedId, onChange }: BrandPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = brands.find((b) => b.id === selectedId) ?? brands[0];

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (brands.length <= 1) return null;

  return (
    <div className={styles.dropdownWrap} ref={ref}>
      <Button variant="unstyled" className={styles.brandPickerBtn} onClick={() => setOpen((o) => !o)}>
        <span className={styles.brandPickerDot} />
        {selected?.name ?? "All brands"}
        <Icon icon="expand_more" size={14} color="current" />
      </Button>
      {open && (
        <div className={styles.dropdownMenu}>
          {brands.map((b) => (
            <Button
              variant="unstyled"
              key={b.id}
              className={[
                styles.dropdownItem,
                selectedId === b.id ? styles.dropdownItemActive : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => {
                onChange(b.id);
                setOpen(false);
              }}
            >
              {b.name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── DatePickerPopup ──────────────────────────────────────────────────────────

type DatePickerPopupProps = {
  date: Date;
  today: Date;
  locale: string;
  previousMonthLabel: string;
  nextMonthLabel: string;
  onSelect: (d: Date) => void;
  onClose: () => void;
};

function DatePickerPopup({
  date,
  today,
  locale,
  previousMonthLabel,
  nextMonthLabel,
  onSelect,
  onClose,
}: DatePickerPopupProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div className={styles.datePickerPopup} ref={ref}>
      <MiniCalendar
        selected={date}
        today={today}
        locale={locale}
        previousMonthLabel={previousMonthLabel}
        nextMonthLabel={nextMonthLabel}
        onSelect={(d) => {
          onSelect(d);
          onClose();
        }}
      />
    </div>
  );
}

// ─── EmptyState (no reservations yet) ────────────────────────────────────────

function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateIcon}>
        <Icon icon="event_available" size={32} color="primary" />
      </div>
      <p className={styles.emptyStateTitle}>{title}</p>
      <p className={styles.emptyStateDesc}>{desc}</p>
    </div>
  );
}

// ─── CalendarSettingsPopup ───────────────────────────────────────────────────

type TimeFormat = "12h" | "24h";

type CalendarSettingsPopupProps = {
  timeFormat: TimeFormat;
  settingsTitle: string;
  settingsTimeFormatLabel: string;
  timeFormat12hLabel: string;
  timeFormat24hLabel: string;
  onTimeFormatChange: (f: TimeFormat) => void;
  onClose: () => void;
};

function CalendarSettingsPopup({ timeFormat, settingsTitle, settingsTimeFormatLabel, timeFormat12hLabel, timeFormat24hLabel, onTimeFormatChange, onClose }: CalendarSettingsPopupProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div className={styles.settingsPopup} ref={ref}>
      <p className={styles.settingsTitle}>{settingsTitle}</p>
      <div className={styles.settingsRow}>
        <span className={styles.settingsLabel}>{settingsTimeFormatLabel}</span>
        <div className={styles.settingsToggleGroup}>
          <Button
            variant="unstyled"
            className={[styles.settingsToggleBtn, timeFormat === "12h" ? styles.settingsToggleBtnActive : ""].filter(Boolean).join(" ")}
            onClick={() => onTimeFormatChange("12h")}
          >
            {timeFormat12hLabel}
          </Button>
          <Button
            variant="unstyled"
            className={[styles.settingsToggleBtn, timeFormat === "24h" ? styles.settingsToggleBtnActive : ""].filter(Boolean).join(" ")}
            onClick={() => onTimeFormatChange("24h")}
          >
            {timeFormat24hLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── TimeGrid (Day / Week) ────────────────────────────────────────────────────

const SLOT_HEIGHT = 56;

type TimeGridProps = {
  days: Date[];
  today: Date;
  locale: string;
  timeFormat: TimeFormat;
  emptyTitle: string;
  emptyDesc: string;
  events: CalendarEvent[];
  workingByWeekday: Map<number, Array<{ start: number; end: number }>>;
  onEventClick: (e: CalendarEvent) => void;
};

function TimeGrid({ days, today, locale, timeFormat, emptyTitle, emptyDesc, events, workingByWeekday, onEventClick }: TimeGridProps) {
  const dayShorts = useMemo(() => getIntlDayShorts(locale), [locale]);
  const nowRef = useRef<HTMLDivElement>(null);
  const now = new Date();
  const nowTop = (now.getHours() * 60 + now.getMinutes()) / 60 * SLOT_HEIGHT;
  const todayIndex = days.findIndex((d) => isSameDay(d, today));

  useEffect(() => {
    nowRef.current?.scrollIntoView({ block: "center", behavior: "instant" });
  }, []);

  const isDayView = days.length === 1;

  const dayKeys = days.map((d) => localDateKey(d));
  const visibleEvents = events.filter((e) => dayKeys.includes(e.dayKey));

  return (
    <div className={styles.timeGrid}>
      {!isDayView && (
        <div className={styles.timeGridHeader}>
          <div className={styles.timeGutter} />
          {days.map((d) => {
            const isToday = isSameDay(d, today);
            return (
              <div
                key={d.toISOString()}
                className={[styles.dayColumn, isToday ? styles.dayColumnToday : ""]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span
                  className={[
                    styles.dayNumber,
                    isToday ? styles.dayNumberToday : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {d.getDate()}
                </span>
                <span className={styles.dayName}>{dayShorts[d.getDay()]}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.timeGridBody}>
        <div className={styles.timeGridInner}>
          {HOURS.map((h) => (
            <div key={h} className={styles.timeSlot} style={{ height: SLOT_HEIGHT }}>
              <span className={styles.timeLabel}>
                {h === 0
                  ? ""
                  : timeFormat === "24h"
                    ? `${String(h).padStart(2, "0")}:00`
                    : h < 12
                      ? `${h} AM`
                      : h === 12
                        ? "12 PM"
                        : `${h - 12} PM`}
              </span>
              <div className={styles.timeSlotLine} />
            </div>
          ))}

          {/* Working-hours background bands */}
          {days.map((d, dayIndex) => {
            const wins = workingByWeekday.get(d.getDay()) ?? [];
            return wins.map((w, i) => (
              <div
                key={`wh-${dayIndex}-${i}`}
                className={styles.workingBand}
                style={{
                  top: (w.start / 60) * SLOT_HEIGHT,
                  height: ((w.end - w.start) / 60) * SLOT_HEIGHT,
                  left: `calc(3.5rem + ${dayIndex} * (100% - 3.5rem) / ${days.length})`,
                  width: `calc((100% - 3.5rem) / ${days.length})`,
                }}
              />
            ));
          })}

          {/* Current time indicator */}
          {todayIndex !== -1 && (
            <div
              ref={nowRef}
              className={styles.nowLine}
              style={{
                top: nowTop,
                left: `calc(3.5rem + ${todayIndex} * (100% - 3.5rem) / ${days.length})`,
                width: `calc((100% - 3.5rem) / ${days.length})`,
              }}
            />
          )}

          {/* Reservation events */}
          {visibleEvents.map((e) => {
            const dayIndex = dayKeys.indexOf(e.dayKey);
            if (dayIndex === -1) return null;
            const top = (e.startMin / 60) * SLOT_HEIGHT;
            const height = Math.max(((e.endMin - e.startMin) / 60) * SLOT_HEIGHT, 18);
            const cancelled =
              e.reservation.status === "CANCELLED_BY_UCR" ||
              e.reservation.status === "CANCELLED_BY_USO";
            return (
              <button
                type="button"
                key={e.reservation.id}
                className={[styles.event, cancelled ? styles.eventCancelled : ""].filter(Boolean).join(" ")}
                style={{
                  top,
                  height,
                  left: `calc(3.5rem + ${dayIndex} * (100% - 3.5rem) / ${days.length} + 2px)`,
                  width: `calc((100% - 3.5rem) / ${days.length} - 4px)`,
                  borderLeftColor: e.color,
                }}
                onClick={() => onEventClick(e)}
              >
                <span className={styles.eventTime}>
                  {String(Math.floor(e.startMin / 60)).padStart(2, "0")}:
                  {String(e.startMin % 60).padStart(2, "0")}
                </span>
                <span className={styles.eventTitle}>{e.title}</span>
              </button>
            );
          })}
        </div>

        {visibleEvents.length === 0 && (
          <div className={styles.timeGridEmptyOverlay}>
            <EmptyState title={emptyTitle} desc={emptyDesc} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MonthGrid ────────────────────────────────────────────────────────────────

type MonthGridProps = {
  date: Date;
  selectedDate: Date;
  today: Date;
  locale: string;
  events: CalendarEvent[];
  onDayClick: (d: Date) => void;
};

function MonthGrid({ date, selectedDate, today, locale, events, onDayClick }: MonthGridProps) {
  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const list = map.get(e.dayKey) ?? [];
      list.push(e);
      map.set(e.dayKey, list);
    }
    return map;
  }, [events]);
  const dayShorts = useMemo(() => getIntlDayShorts(locale), [locale]);
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<Date | null> = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className={styles.monthGrid}>
      <div className={styles.monthGridHeader}>
        {dayShorts.map((d, i) => (
          <span key={i} className={styles.monthDayLabel}>
            {d}
          </span>
        ))}
      </div>
      <div className={styles.monthGridBody}>
        {cells.map((d, i) => {
          const isToday = d ? isSameDay(d, today) : false;
          const isSelected = d ? isSameDay(d, selectedDate) : false;
          return (
            <div
              key={i}
              className={[
                styles.monthCell,
                !d ? styles.monthCellEmpty : "",
                isToday ? styles.monthCellToday : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => d && onDayClick(d)}
            >
              {d && (
                <span
                  className={[
                    styles.monthCellNum,
                    isToday ? styles.monthCellNumToday : "",
                    isSelected && !isToday ? styles.monthCellNumSelected : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {d.getDate()}
                </span>
              )}
              {d && (eventsByDay.get(localDateKey(d))?.length ?? 0) > 0 && (
                <span className={styles.monthCellDots}>
                  {(eventsByDay.get(localDateKey(d)) ?? []).slice(0, 3).map((e) => (
                    <span key={e.reservation.id} className={styles.monthCellDot} style={{ background: e.color }} />
                  ))}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── CalendarToolbar ──────────────────────────────────────────────────────────

type CalendarToolbarProps = {
  date: Date;
  today: Date;
  view: CalendarView;
  locale: string;
  sidebarOpen: boolean;
  brands: CalendarBrand[];
  selectedBrandId: string;
  isNewDisabled: boolean;
  showNewButton: boolean;
  timeFormat: TimeFormat;
  viewLabels: Record<CalendarView, string>;
  todayLabel: string;
  filterLabel: string;
  newLabel: string;
  previousMonthLabel: string;
  nextMonthLabel: string;
  previousPeriodLabel: string;
  nextPeriodLabel: string;
  moreOptionsLabel: string;
  toggleSidebarLabel: string;
  settingsTitleLabel: string;
  settingsTimeFormatLabel: string;
  timeFormat12hLabel: string;
  timeFormat24hLabel: string;
  onToggleSidebar: () => void;
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
  onViewChange: (v: CalendarView) => void;
  onDateSelect: (d: Date) => void;
  onBrandChange: (id: string) => void;
  onNew: () => void;
  onTimeFormatChange: (f: TimeFormat) => void;
};

function CalendarToolbar({
  date,
  today,
  view,
  locale,
  sidebarOpen,
  brands,
  selectedBrandId,
  isNewDisabled,
  showNewButton,
  timeFormat,
  viewLabels,
  todayLabel,
  filterLabel,
  newLabel,
  previousMonthLabel,
  nextMonthLabel,
  previousPeriodLabel,
  nextPeriodLabel,
  moreOptionsLabel,
  toggleSidebarLabel,
  settingsTitleLabel,
  settingsTimeFormatLabel,
  timeFormat12hLabel,
  timeFormat24hLabel,
  onToggleSidebar,
  onToday,
  onPrev,
  onNext,
  onViewChange,
  onDateSelect,
  onBrandChange,
  onNew,
  onTimeFormatChange,
}: CalendarToolbarProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarLeft}>
        <Button variant="unstyled" className={styles.todayBtn} onClick={onToday}>
          {todayLabel}
        </Button>

        <div className={styles.navGroup}>
          <Button variant="unstyled" className={styles.toolbarIconBtn} onClick={onPrev} aria-label={previousPeriodLabel}>
            <Icon icon="chevron_left" size={18} color="current" />
          </Button>
          <Button variant="unstyled" className={styles.toolbarIconBtn} onClick={onNext} aria-label={nextPeriodLabel}>
            <Icon icon="chevron_right" size={18} color="current" />
          </Button>
        </div>

        <div className={styles.dateLabelWrap}>
          <Button
            variant="unstyled"
            className={styles.dateLabel}
            onClick={() => setDatePickerOpen((o) => !o)}
          >
            {formatDateLabel(date, view, locale)}
            <Icon icon="expand_more" size={14} color="current" />
          </Button>
          {datePickerOpen && (
            <DatePickerPopup
              date={date}
              today={today}
              locale={locale}
              previousMonthLabel={previousMonthLabel}
              nextMonthLabel={nextMonthLabel}
              onSelect={onDateSelect}
              onClose={() => setDatePickerOpen(false)}
            />
          )}
        </div>
      </div>

      <div className={styles.toolbarRight}>
        <ViewSwitcherDropdown view={view} labels={viewLabels} onChange={onViewChange} />

        <Button variant="unstyled" className={styles.toolbarFilterBtn} aria-label={filterLabel}>
          <Icon icon="filter_list" size={16} color="current" />
          <span>{filterLabel}</span>
        </Button>

        <BrandPickerDropdown
          brands={brands}
          selectedId={selectedBrandId}
          onChange={onBrandChange}
        />

        {showNewButton && (
          <Button variant="primary" size="small" icon="event_busy" onClick={onNew} disabled={isNewDisabled}>
            {newLabel}
          </Button>
        )}

        <Button
          variant="unstyled"
          className={[
            styles.toolbarIconBtn,
            sidebarOpen ? styles.toolbarIconBtnActive : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={onToggleSidebar}
          aria-label={toggleSidebarLabel}
        >
          <Icon icon="right_panel_open" size={18} color="current" />
        </Button>
      </div>
    </div>
  );
}

// ─── UsoCalendarPage ──────────────────────────────────────────────────────────

type UsoCalendarPageProps = {
  services: Service[];
  brands: Brand[];
  reservations: Reservation[];
  accessToken: string;
  // "provider" → USO managing incoming bookings; "customer" → UCR viewing their
  // own reservations (read-only except cancel, no availability/requests tools).
  mode?: "provider" | "customer";
};

export function UsoCalendarPage({ services, brands, reservations, accessToken, mode = "provider" }: UsoCalendarPageProps) {
  const { locale, messages: m } = useLocale();
  const t = m.calendar;
  const isProvider = mode === "provider";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [reservationItems, setReservationItems] = useState<Reservation[]>(reservations);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const handleReservationUpdated = useCallback((updated: Reservation) => {
    setReservationItems((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
    setSelectedEvent(null);
  }, []);

  const viewLabels: Record<CalendarView, string> = useMemo(() => ({
    day: t.viewDay,
    work_week: t.viewWorkWeek,
    week: t.viewWeek,
    month: t.viewMonth,
  }), [t]);

  const calendarBrands: CalendarBrand[] = [
    { id: "all", name: t.allBrands },
    ...brands.map((b) => ({ id: b.id, name: b.name })),
  ];

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [view, setView] = useState<CalendarView>("day");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Close sidebar by default on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      queueMicrotask(() => setSidebarOpen(false));
    }
  }, []);
  const [timeFormat, setTimeFormat] = useState<TimeFormat>("24h");
  const [selectedBrandId, setSelectedBrandId] = useState("all");
  const [calendarServices, setCalendarServices] = useState<CalendarService[]>(() => {
    // Build the service chip list from owned services plus any service referenced
    // by a reservation (covers the customer view where `services` is empty).
    const seen = new Map<string, string>();
    for (const s of services) seen.set(s.id, s.title);
    for (const r of reservations) if (!seen.has(r.service_id)) seen.set(r.service_id, r.service?.title ?? "—");
    return [...seen.entries()].map(([id, name], i) => ({
      id,
      name,
      color: assignServiceColor(i),
      enabled: true,
    }));
  });

  const handleServiceToggle = useCallback((id: string) => {
    setCalendarServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    );
  }, []);

  const serviceBrandMap = useMemo(() => {
    const map = new Map<string, string | null>();
    for (const s of services) map.set(s.id, s.brand_id ?? null);
    return map;
  }, [services]);

  // Working-hours background per weekday: union of all CUSTOM service schedules.
  // (BRANCH-hours services derive from branch opening times, not shown here.)
  const workingByWeekday = useMemo(() => {
    const map = new Map<number, Array<{ start: number; end: number }>>();
    for (const s of services) {
      if (s.hours_source !== "CUSTOM") continue;
      for (const w of s.schedule ?? []) {
        const list = map.get(w.weekday) ?? [];
        list.push({ start: w.start_min, end: w.end_min });
        map.set(w.weekday, list);
      }
    }
    return map;
  }, [services]);

  const events: CalendarEvent[] = useMemo(() => {
    const colorById = new Map(calendarServices.map((s) => [s.id, s] as const));
    return reservationItems
      .filter((r) => ACTIVE_EVENT_STATUSES.includes(r.status))
      .filter((r) => {
        const cs = colorById.get(r.service_id);
        // Show events even if the service isn't in the owner's enabled list
        // (e.g. team-assigned services), but respect explicit disable toggles.
        return !cs || cs.enabled;
      })
      .filter((r) => {
        if (selectedBrandId === "all") return true;
        return serviceBrandMap.get(r.service_id) === selectedBrandId;
      })
      .map((r) => {
        const cs = colorById.get(r.service_id);
        return {
          reservation: r,
          dayKey: r.starts_at.slice(0, 10),
          startMin: minutesFromIso(r.starts_at),
          endMin: minutesFromIso(r.ends_at),
          color: cs?.color ?? SERVICE_COLORS[0],
          title: r.service?.title ?? cs?.name ?? "—",
        };
      });
  }, [reservationItems, calendarServices, selectedBrandId, serviceBrandMap]);

  const handleDateSelect = (d: Date) => {
    setCurrentDate(d);
    setSelectedDate(d);
    if (view !== "month" && view !== "day") setView("day");
  };

  const handleMonthCellClick = (d: Date) => {
    setCurrentDate(d);
    setSelectedDate(d);
  };

  const days = view !== "month" ? getDaysInView(currentDate, view) : [];

  return (
    <div className={styles.calendarRoot}>
      {sidebarOpen && (
        <div
          className={styles.sidebarBackdrop}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className={styles.calendarMain}>
        <CalendarToolbar
          date={currentDate}
          today={today}
          view={view}
          locale={locale}
          sidebarOpen={sidebarOpen}
          brands={calendarBrands}
          selectedBrandId={selectedBrandId}
          isNewDisabled={false}
          showNewButton={isProvider}
          timeFormat={timeFormat}
          viewLabels={viewLabels}
          todayLabel={t.today}
          filterLabel={t.filter}
          newLabel={t.dayOffsTitle}
          previousMonthLabel={t.previousMonth}
          nextMonthLabel={t.nextMonth}
          previousPeriodLabel={t.previousPeriod}
          nextPeriodLabel={t.nextPeriod}
          moreOptionsLabel={t.moreOptions}
          toggleSidebarLabel={t.toggleSidebar}
          settingsTitleLabel={t.settingsTitle}
          settingsTimeFormatLabel={t.settingsTimeFormat}
          timeFormat12hLabel={t.timeFormat12h}
          timeFormat24hLabel={t.timeFormat24h}
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
          onToday={() => { setCurrentDate(new Date()); setSelectedDate(today); }}
          onPrev={() => setCurrentDate((d) => navigateDate(d, view, -1))}
          onNext={() => setCurrentDate((d) => navigateDate(d, view, 1))}
          onViewChange={setView}
          onDateSelect={handleDateSelect}
          onBrandChange={setSelectedBrandId}
          onNew={() => setAvailabilityOpen(true)}
          onTimeFormatChange={setTimeFormat}
        />

        {isProvider && (
          <PendingRequestsPanel
            reservations={reservationItems}
            accessToken={accessToken}
            onUpdated={(r) => setReservationItems((prev) => prev.map((x) => (x.id === r.id ? { ...x, ...r } : x)))}
            onJump={(d) => {
              setCurrentDate(d);
              setSelectedDate(d);
              setView("day");
            }}
          />
        )}

        <div className={styles.calendarBody}>
          {view === "month" ? (
            <MonthGrid
              date={currentDate}
              selectedDate={selectedDate}
              today={today}
              locale={locale}
              events={events}
              onDayClick={handleMonthCellClick}
            />
          ) : (
            <TimeGrid
              days={days}
              today={today}
              locale={locale}
              timeFormat={timeFormat}
              emptyTitle={t.noReservationsTitle}
              emptyDesc={t.noReservationsDesc}
              events={events}
              workingByWeekday={workingByWeekday}
              onEventClick={setSelectedEvent}
            />
          )}
        </div>
      </div>

      <CalendarSidebar
        open={sidebarOpen}
        selected={currentDate}
        today={today}
        locale={locale}
        services={calendarServices}
        showServices={isProvider}
        myServicesLabel={t.myServices}
        noServicesLabel={t.noServicesYet}
        previousMonthLabel={t.previousMonth}
        nextMonthLabel={t.nextMonth}
        closeSidebarLabel={t.closeSidebar}
        onDateSelect={setCurrentDate}
        onServiceToggle={handleServiceToggle}
        onClose={() => setSidebarOpen(false)}
      />

      {selectedEvent && (
        <ReservationDetailPopup
          reservation={selectedEvent.reservation}
          accessToken={accessToken}
          mode={mode}
          onUpdated={handleReservationUpdated}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {isProvider && (
        <AvailabilityModal
          open={availabilityOpen}
          accessToken={accessToken}
          onClose={() => setAvailabilityOpen(false)}
        />
      )}
    </div>
  );
}
