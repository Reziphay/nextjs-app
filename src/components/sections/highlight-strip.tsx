import type { StatItem } from "@/types/content";

import { Reveal } from "@/components/sections/reveal";

interface HighlightStripProps {
  items: StatItem[];
}

export function HighlightStrip({ items }: HighlightStripProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {items.map((item, index) => (
        <Reveal delay={index * 0.05} key={item.label}>
          <article className="rounded-[1.75rem] border border-border/80 bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-strong">
              {item.value}
            </div>
            <h3 className="mt-3 text-xl font-semibold tracking-tight">{item.label}</h3>
            <p className="mt-3 text-sm leading-6 text-muted">{item.description}</p>
          </article>
        </Reveal>
      ))}
    </div>
  );
}

