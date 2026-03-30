import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/lib/utils/cn";

export type ButtonKind =
  | "primary"
  | "secondary"
  | "ghost"
  | "admin"
  | "destructive";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    kind?: ButtonKind;
    fullWidth?: boolean;
  }
>;

export function buttonStyles({
  className,
  fullWidth = false,
  kind = "primary",
}: {
  kind?: ButtonKind;
  fullWidth?: boolean;
  className?: string;
}) {
  return cn(
    "inline-flex h-12 items-center justify-center rounded-[18px] px-5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60",
    kind === "primary" &&
      "bg-[var(--color-primary)] text-white shadow-[var(--shadow-card)] hover:bg-[var(--color-primary-strong)]",
    kind === "secondary" &&
      "border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-ink)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-primary)]",
    kind === "ghost" &&
      "bg-transparent text-[var(--color-ink-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-ink)]",
    kind === "admin" &&
      "bg-[var(--color-panel-dark)] text-[var(--color-paper)] shadow-[var(--shadow-card)] hover:opacity-95",
    kind === "destructive" &&
      "bg-[var(--color-error)] text-white hover:opacity-90",
    fullWidth && "w-full",
    className,
  );
}

export function Button({
  children,
  className,
  kind = "primary",
  fullWidth = false,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonStyles({ className, fullWidth, kind })}
      {...props}
    >
      {children}
    </button>
  );
}
