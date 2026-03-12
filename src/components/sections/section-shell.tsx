import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface SectionShellProps extends HTMLAttributes<HTMLElement> {
  as?: "div" | "section";
  children: ReactNode;
  tone?: "accent" | "default" | "surface";
}

const toneClasses = {
  accent: "rounded-[2rem] border border-accent/15 bg-[#f6e6da]",
  default: "",
  surface: "rounded-[2rem] border border-border/80 bg-card/80",
};

export function SectionShell({
  as,
  children,
  className,
  tone = "default",
  ...props
}: SectionShellProps) {
  const Comp = as ?? "section";

  return (
    <Comp
      className={cn("container-shell py-8 sm:py-10 lg:py-14", className)}
      {...props}
    >
      <div className={cn("p-0", toneClasses[tone])}>{children}</div>
    </Comp>
  );
}
