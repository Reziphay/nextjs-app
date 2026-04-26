"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/atoms/button";
import { Checkbox } from "@/components/atoms/checkbox";
import { Icon } from "@/components/icon";
import type { Service } from "@/types/service";
import type { Brand } from "@/types/brand";
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
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const VIEW_LABELS: Record<CalendarView, string> = {
  day: "Day",
  work_week: "Work week",
  week: "Week",
  month: "Month",
};

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

function formatDateLabel(date: Date, view: CalendarView): string {
  const m = MONTHS[date.getMonth()];
  const y = date.getFullYear();
  if (view === "day") return `${m} ${date.getDate()}, ${y}`;
  if (view === "month") return `${m} ${y}`;
  const weekStart = startOfWeek(date, view === "work_week" ? 1 : 0);
  const weekEnd = addDays(weekStart, view === "work_week" ? 4 : 6);
  if (weekStart.getMonth() === weekEnd.getMonth()) return `${m} ${y}`;
  if (weekStart.getFullYear() !== weekEnd.getFullYear()) {
    return `${MONTHS_SHORT[weekStart.getMonth()]} ${weekStart.getFullYear()} – ${MONTHS_SHORT[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;
  }
  return `${MONTHS_SHORT[weekStart.getMonth()]} – ${MONTHS_SHORT[weekEnd.getMonth()]} ${y}`;
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
  onSelect: (d: Date) => void;
};

function MiniCalendar({ selected, today, onSelect }: MiniCalendarProps) {
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
      setViewing(d);
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
          {MONTHS_SHORT[month]} {year}
        </span>
        <div className={styles.miniCalNav}>
          <button className={styles.miniCalBtn} onClick={prevMonth} aria-label="Previous month">
            <Icon icon="chevron_left" size={14} color="current" />
          </button>
          <button className={styles.miniCalBtn} onClick={nextMonth} aria-label="Next month">
            <Icon icon="chevron_right" size={14} color="current" />
          </button>
        </div>
      </div>
      <div className={styles.miniCalGrid}>
        {DAYS_SHORT.map((d) => (
          <span key={d} className={styles.miniCalDayLabel}>
            {d[0]}
          </span>
        ))}
        {cells.map((date, i) => {
          if (!date) return <span key={`empty-${i}`} />;
          const isToday = isSameDay(date, today);
          const isSelected = isSameDay(date, selected);
          return (
            <button
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
            </button>
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
  services: CalendarService[];
  onDateSelect: (d: Date) => void;
  onServiceToggle: (id: string) => void;
  onClose: () => void;
};

function CalendarSidebar({
  open,
  selected,
  today,
  services,
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
        <button
          className={styles.sidebarCloseBtn}
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <Icon icon="close" size={18} color="current" />
        </button>
        <MiniCalendar selected={selected} today={today} onSelect={onDateSelect} />

        {services.length > 0 && (
          <div className={styles.myServices}>
            <p className={styles.myServicesTitle}>My services</p>
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

        {services.length === 0 && (
          <div className={styles.myServices}>
            <p className={styles.myServicesTitle}>My services</p>
            <p className={styles.myServicesEmpty}>No services yet</p>
          </div>
        )}
      </div>
    </aside>
  );
}

// ─── ViewSwitcherDropdown ─────────────────────────────────────────────────────

type ViewSwitcherProps = {
  view: CalendarView;
  onChange: (v: CalendarView) => void;
};

function ViewSwitcherDropdown({ view, onChange }: ViewSwitcherProps) {
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
      <button className={styles.viewSwitcherBtn} onClick={() => setOpen((o) => !o)}>
        {VIEW_LABELS[view]}
        <Icon icon="expand_more" size={14} color="current" />
      </button>
      {open && (
        <div className={styles.dropdownMenu}>
          {(["day", "work_week", "week", "month"] as CalendarView[]).map((v) => (
            <button
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
              {VIEW_LABELS[v]}
            </button>
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
      <button className={styles.brandPickerBtn} onClick={() => setOpen((o) => !o)}>
        <span className={styles.brandPickerDot} />
        {selected?.name ?? "All brands"}
        <Icon icon="expand_more" size={14} color="current" />
      </button>
      {open && (
        <div className={styles.dropdownMenu}>
          {brands.map((b) => (
            <button
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
            </button>
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
  onSelect: (d: Date) => void;
  onClose: () => void;
};

function DatePickerPopup({ date, today, onSelect, onClose }: DatePickerPopupProps) {
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
        onSelect={(d) => {
          onSelect(d);
          onClose();
        }}
      />
    </div>
  );
}

// ─── EmptyState (no reservations yet) ────────────────────────────────────────

function EmptyState() {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateIcon}>
        <Icon icon="event_available" size={32} color="primary" />
      </div>
      <p className={styles.emptyStateTitle}>No reservations yet</p>
      <p className={styles.emptyStateDesc}>
        Reservations will appear here once customers start booking your services.
      </p>
    </div>
  );
}

// ─── CalendarSettingsPopup ───────────────────────────────────────────────────

type TimeFormat = "12h" | "24h";

type CalendarSettingsPopupProps = {
  timeFormat: TimeFormat;
  onTimeFormatChange: (f: TimeFormat) => void;
  onClose: () => void;
};

function CalendarSettingsPopup({ timeFormat, onTimeFormatChange, onClose }: CalendarSettingsPopupProps) {
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
      <p className={styles.settingsTitle}>Calendar settings</p>
      <div className={styles.settingsRow}>
        <span className={styles.settingsLabel}>Time format</span>
        <div className={styles.settingsToggleGroup}>
          <button
            className={[styles.settingsToggleBtn, timeFormat === "12h" ? styles.settingsToggleBtnActive : ""].filter(Boolean).join(" ")}
            onClick={() => onTimeFormatChange("12h")}
          >
            AM/PM
          </button>
          <button
            className={[styles.settingsToggleBtn, timeFormat === "24h" ? styles.settingsToggleBtnActive : ""].filter(Boolean).join(" ")}
            onClick={() => onTimeFormatChange("24h")}
          >
            24h
          </button>
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
  timeFormat: TimeFormat;
};

function TimeGrid({ days, today, timeFormat }: TimeGridProps) {
  const nowRef = useRef<HTMLDivElement>(null);
  const now = new Date();
  const nowTop = (now.getHours() * 60 + now.getMinutes()) / 60 * SLOT_HEIGHT;
  const todayIndex = days.findIndex((d) => isSameDay(d, today));

  useEffect(() => {
    nowRef.current?.scrollIntoView({ block: "center", behavior: "instant" });
  }, []);

  return (
    <div className={styles.timeGrid}>
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
              <span className={styles.dayName}>{DAYS_SHORT[d.getDay()]}</span>
            </div>
          );
        })}
      </div>

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
        </div>

        {/* Empty state overlay (no reservations) */}
        <div className={styles.timeGridEmptyOverlay}>
          <EmptyState />
        </div>
      </div>
    </div>
  );
}

// ─── MonthGrid ────────────────────────────────────────────────────────────────

type MonthGridProps = {
  date: Date;
  selectedDate: Date;
  today: Date;
  onDayClick: (d: Date) => void;
};

function MonthGrid({ date, selectedDate, today, onDayClick }: MonthGridProps) {
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
        {DAYS_SHORT.map((d) => (
          <span key={d} className={styles.monthDayLabel}>
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
  sidebarOpen: boolean;
  brands: CalendarBrand[];
  selectedBrandId: string;
  isNewDisabled: boolean;
  timeFormat: TimeFormat;
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
  sidebarOpen,
  brands,
  selectedBrandId,
  isNewDisabled,
  timeFormat,
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
        <button className={styles.todayBtn} onClick={onToday}>
          Today
        </button>

        <div className={styles.navGroup}>
          <button className={styles.toolbarIconBtn} onClick={onPrev} aria-label="Previous">
            <Icon icon="chevron_left" size={18} color="current" />
          </button>
          <button className={styles.toolbarIconBtn} onClick={onNext} aria-label="Next">
            <Icon icon="chevron_right" size={18} color="current" />
          </button>
        </div>

        <div className={styles.dateLabelWrap}>
          <button
            className={styles.dateLabel}
            onClick={() => setDatePickerOpen((o) => !o)}
          >
            {formatDateLabel(date, view)}
            <Icon icon="expand_more" size={14} color="current" />
          </button>
          {datePickerOpen && (
            <DatePickerPopup
              date={date}
              today={today}
              onSelect={onDateSelect}
              onClose={() => setDatePickerOpen(false)}
            />
          )}
        </div>
      </div>

      <div className={styles.toolbarRight}>
        <div className={styles.settingsWrap} ref={settingsRef}>
          <button
            className={[styles.toolbarIconBtn, settingsOpen ? styles.toolbarIconBtnActive : ""].filter(Boolean).join(" ")}
            onClick={() => setSettingsOpen((o) => !o)}
            aria-label="More options"
          >
            <Icon icon="more_horiz" size={18} color="current" />
          </button>
          {settingsOpen && (
            <CalendarSettingsPopup
              timeFormat={timeFormat}
              onTimeFormatChange={(f) => { onTimeFormatChange(f); }}
              onClose={() => setSettingsOpen(false)}
            />
          )}
        </div>

        <ViewSwitcherDropdown view={view} onChange={onViewChange} />

        <button className={styles.toolbarFilterBtn} aria-label="Filter">
          <Icon icon="filter_list" size={16} color="current" />
          <span>Filter</span>
        </button>

        <BrandPickerDropdown
          brands={brands}
          selectedId={selectedBrandId}
          onChange={onBrandChange}
        />

        <Button variant="primary" size="small" icon="add" onClick={onNew} disabled={isNewDisabled}>
          New
        </Button>

        <button
          className={[
            styles.toolbarIconBtn,
            sidebarOpen ? styles.toolbarIconBtnActive : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Icon icon="right_panel_open" size={18} color="current" />
        </button>
      </div>
    </div>
  );
}

// ─── UsoCalendarPage ──────────────────────────────────────────────────────────

type UsoCalendarPageProps = {
  services: Service[];
  brands: Brand[];
};

export function UsoCalendarPage({ services, brands }: UsoCalendarPageProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const calendarBrands: CalendarBrand[] = [
    { id: "all", name: "All brands" },
    ...brands.map((b) => ({ id: b.id, name: b.name })),
  ];

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [view, setView] = useState<CalendarView>("week");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Open sidebar by default only on desktop
  useEffect(() => {
    if (window.innerWidth >= 768) setSidebarOpen(true);
  }, []);
  const [timeFormat, setTimeFormat] = useState<TimeFormat>("24h");
  const [selectedBrandId, setSelectedBrandId] = useState("all");
  const [calendarServices, setCalendarServices] = useState<CalendarService[]>(() =>
    services.map((s, i) => ({
      id: s.id,
      name: s.title,
      color: assignServiceColor(i),
      enabled: true,
    })),
  );

  const handleServiceToggle = useCallback((id: string) => {
    setCalendarServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    );
  }, []);

  const handleDateSelect = (d: Date) => {
    setCurrentDate(d);
    setSelectedDate(d);
    if (view !== "month" && view !== "day") setView("day");
  };

  const handleMonthCellClick = (d: Date) => {
    setCurrentDate(d);
    setSelectedDate(d);
  };

  // "New" disabled when the action date is strictly before today
  const isNewDisabled = (() => {
    if (view === "day") {
      return currentDate.getTime() < today.getTime();
    }
    if (view === "month") {
      return selectedDate.getTime() < today.getTime();
    }
    // week / work_week: disabled only when the last visible day is before today
    const days = getDaysInView(currentDate, view);
    const lastDay = days[days.length - 1];
    const lastDayNorm = new Date(lastDay);
    lastDayNorm.setHours(0, 0, 0, 0);
    return lastDayNorm.getTime() < today.getTime();
  })();

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
          sidebarOpen={sidebarOpen}
          brands={calendarBrands}
          selectedBrandId={selectedBrandId}
          isNewDisabled={isNewDisabled}
          timeFormat={timeFormat}
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
          onToday={() => { setCurrentDate(new Date()); setSelectedDate(today); }}
          onPrev={() => setCurrentDate((d) => navigateDate(d, view, -1))}
          onNext={() => setCurrentDate((d) => navigateDate(d, view, 1))}
          onViewChange={setView}
          onDateSelect={handleDateSelect}
          onBrandChange={setSelectedBrandId}
          onNew={() => {}}
          onTimeFormatChange={setTimeFormat}
        />

        <div className={styles.calendarBody}>
          {view === "month" ? (
            <MonthGrid
              date={currentDate}
              selectedDate={selectedDate}
              today={today}
              onDayClick={handleMonthCellClick}
            />
          ) : (
            <TimeGrid days={days} today={today} timeFormat={timeFormat} />
          )}
        </div>
      </div>

      <CalendarSidebar
        open={sidebarOpen}
        selected={currentDate}
        today={today}
        services={calendarServices}
        onDateSelect={setCurrentDate}
        onServiceToggle={handleServiceToggle}
        onClose={() => setSidebarOpen(false)}
      />
    </div>
  );
}
