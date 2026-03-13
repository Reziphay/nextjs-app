import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type FilterOption = {
  label: string;
  value: string;
};

type SummaryChip = FilterOption & {
  count: number;
};

type AdminFilterBarProps = {
  action: string;
  query?: string;
  queryPlaceholder: string;
  selectLabel: string;
  selectedValue?: string;
  options: FilterOption[];
  summaryChips: SummaryChip[];
};

function buildHref(action: string, query?: string, selectedValue?: string) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  if (selectedValue && selectedValue !== "all") {
    params.set("status", selectedValue);
  }

  const suffix = params.toString();

  return suffix ? `${action}?${suffix}` : action;
}

export function AdminFilterBar({
  action,
  options,
  query,
  queryPlaceholder,
  selectLabel,
  selectedValue = "all",
  summaryChips,
}: AdminFilterBarProps) {
  return (
    <div className="space-y-4">
      <form action={action} className="grid gap-4 rounded-[24px] border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-soft)] lg:grid-cols-[minmax(0,1fr)_220px_auto]">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder={queryPlaceholder}
          className="h-12 rounded-[18px] border border-[var(--color-border)] bg-white px-4 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
        />
        <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-ink-faint)]">
          {selectLabel}
          <select
            name="status"
            defaultValue={selectedValue}
            className="h-12 rounded-[18px] border border-[var(--color-border)] bg-white px-4 text-sm font-normal normal-case tracking-normal text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)]"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className={buttonStyles({ kind: "admin" })}>
          Apply
        </button>
      </form>
      <div className="flex flex-wrap gap-3">
        {summaryChips.map((chip) => {
          const active = chip.value === selectedValue;

          return (
            <Link
              key={chip.value}
              href={buildHref(action, query, chip.value)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition",
                active
                  ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-paper)]"
                  : "border-[var(--color-border)] bg-white text-[var(--color-ink-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-ink)]",
              )}
            >
              <span>{chip.label}</span>
              <span className={active ? "text-white/72" : "text-[var(--color-ink-faint)]"}>
                {chip.count}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
