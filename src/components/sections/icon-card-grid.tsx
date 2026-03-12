import {
  ArrowUpRight,
  BadgeCheck,
  BellDot,
  Building2,
  CalendarClock,
  ClipboardList,
  Clock3,
  Layers3,
  MapPin,
  MessageSquare,
  Phone,
  Route,
  ScanLine,
  Search,
  Shield,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

import type { IconCardItem, IconName } from "@/types/content";
import { cn } from "@/lib/utils";

import { Reveal } from "@/components/sections/reveal";
import { Badge } from "@/components/ui/badge";

const iconMap: Record<IconName, typeof Search> = {
  "arrow-up-right": ArrowUpRight,
  "badge-check": BadgeCheck,
  "bell-dot": BellDot,
  "building-2": Building2,
  "calendar-clock": CalendarClock,
  "clipboard-list": ClipboardList,
  "clock-3": Clock3,
  "layers-3": Layers3,
  "map-pin": MapPin,
  "message-square": MessageSquare,
  phone: Phone,
  route: Route,
  "scan-line": ScanLine,
  search: Search,
  shield: Shield,
  sparkles: Sparkles,
  star: Star,
  users: Users,
};

interface IconCardGridProps {
  items: IconCardItem[];
  columns?: "two" | "three";
}

const columnClasses = {
  two: "sm:grid-cols-2",
  three: "sm:grid-cols-2 lg:grid-cols-3",
};

export function IconCardGrid({
  items,
  columns = "three",
}: IconCardGridProps) {
  return (
    <div className={cn("grid gap-4", columnClasses[columns])}>
      {items.map((item, index) => {
        const Icon = iconMap[item.icon];

        return (
          <Reveal delay={index * 0.06} key={item.title}>
            <article className="h-full rounded-[1.75rem] border border-border/80 bg-white p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-4">
                  {item.eyebrow ? <Badge>{item.eyebrow}</Badge> : null}
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-muted">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-soft/70 text-accent-strong">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </article>
          </Reveal>
        );
      })}
    </div>
  );
}

