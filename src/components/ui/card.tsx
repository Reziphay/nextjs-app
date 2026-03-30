import type { HTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/lib/utils/cn";

type CardTone = "default" | "soft" | "subtle" | "dark";

type CardProps = PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    tone?: CardTone;
  }
>;

export function Card({
  children,
  className,
  tone = "default",
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[24px] border p-6",
        tone === "default" &&
          "border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-card)] backdrop-blur-sm",
        tone === "soft" &&
          "border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(242,242,247,0.94)_100%)] shadow-[var(--shadow-soft)] backdrop-blur-sm",
        tone === "subtle" &&
          "border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]",
        tone === "dark" &&
          "border-white/10 bg-[linear-gradient(180deg,#17171c_0%,#1f1f28_100%)] text-[var(--color-paper)] shadow-[var(--shadow-soft)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
