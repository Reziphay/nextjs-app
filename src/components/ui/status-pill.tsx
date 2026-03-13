import { cn } from "@/lib/utils/cn";

type StatusPillProps = {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger";
};

export function StatusPill({
  label,
  tone = "neutral",
}: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        tone === "neutral" &&
          "bg-[var(--color-surface-strong)] text-[var(--color-ink-muted)]",
        tone === "success" &&
          "bg-[color:rgba(31,169,113,0.12)] text-[var(--color-success)]",
        tone === "warning" &&
          "bg-[color:rgba(232,163,23,0.12)] text-[var(--color-warning)]",
        tone === "danger" &&
          "bg-[color:rgba(216,76,76,0.12)] text-[var(--color-error)]",
      )}
    >
      {label}
    </span>
  );
}
