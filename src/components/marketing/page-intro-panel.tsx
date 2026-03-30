import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { Card } from "@/components/ui/card";

type PageIntroPanelProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  aside?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export function PageIntroPanel({
  actions,
  align = "left",
  aside,
  className,
  description,
  eyebrow,
  title,
}: PageIntroPanelProps) {
  return (
    <Card tone="soft" className={cn("overflow-hidden p-8 lg:p-10", className)}>
      <div className={cn("gap-8", aside && "grid lg:grid-cols-[1.1fr_0.9fr] lg:items-start")}>
        <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-3xl"}>
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-[var(--color-ink)] md:text-5xl">
            {title}
          </h1>
          <p className="mt-5 text-base leading-8 text-[var(--color-ink-muted)] md:text-lg md:leading-9">
            {description}
          </p>
          {actions ? <div className="mt-8 flex flex-col gap-4 sm:flex-row">{actions}</div> : null}
        </div>
        {aside ? <div>{aside}</div> : null}
      </div>
    </Card>
  );
}
