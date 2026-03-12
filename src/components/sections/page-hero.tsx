import type { ReactNode } from "react";

import type { PageHeroContent } from "@/types/content";

import { Badge } from "@/components/ui/badge";

interface PageHeroProps {
  hero: PageHeroContent;
  actions?: ReactNode;
  aside?: ReactNode;
  caption?: ReactNode;
}

export function PageHero({ hero, actions, aside, caption }: PageHeroProps) {
  return (
    <section className="container-shell py-6 sm:py-8 lg:py-10">
      <div className="grid gap-8 rounded-[2.25rem] border border-border/80 bg-card px-6 py-8 shadow-[var(--shadow-card)] sm:px-8 sm:py-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-12 lg:py-14">
        <div className="space-y-6">
          <Badge>{hero.eyebrow}</Badge>
          <div className="space-y-4">
            <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {hero.title}
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted sm:text-lg">
              {hero.description}
            </p>
          </div>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
          {caption ? (
            <p className="text-sm leading-6 text-muted">{caption}</p>
          ) : null}
        </div>
        <div className="rounded-[1.75rem] border border-accent/15 bg-[#f7ede4] p-5 sm:p-6">
          {aside}
        </div>
      </div>
    </section>
  );
}

