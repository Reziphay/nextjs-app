import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
};

export function Textarea({
  className,
  error,
  label,
  ...props
}: TextareaProps) {
  return (
    <label className="flex flex-col gap-2 text-sm text-[var(--color-ink)]">
      <span className="font-medium">{label}</span>
      <textarea
        className={cn(
          "min-h-32 rounded-[16px] border border-transparent bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]",
          error && "border-[var(--color-error)] focus:ring-[color:rgba(216,76,76,0.15)]",
          className,
        )}
        {...props}
      />
      {error ? (
        <span className="text-xs text-[var(--color-error)]">{error}</span>
      ) : null}
    </label>
  );
}
