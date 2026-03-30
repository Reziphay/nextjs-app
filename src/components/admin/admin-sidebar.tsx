"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";

const items = [
  { href: "", label: "Overview" },
  { href: "/reports", label: "Reports" },
  { href: "/users", label: "Users" },
  { href: "/brands", label: "Brands" },
  { href: "/services", label: "Services" },
  { href: "/visibility-labels", label: "Visibility labels" },
  { href: "/sponsored-visibility", label: "Sponsored visibility" },
  { href: "/analytics", label: "Analytics" },
  { href: "/activity", label: "Activity" },
  { href: "/settings", label: "Settings" },
];

type AdminSidebarProps = {
  adminRoute: string;
};

export function AdminSidebar({ adminRoute }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-[var(--shadow-soft)] backdrop-blur-sm">
      <div className="mb-6 px-3 pt-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
          Hidden admin
        </p>
        <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
          Reziphay Ops
        </p>
      </div>
      <nav className="space-y-1">
        {items.map((item) => {
          const href = `/${adminRoute}${item.href}`;
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "block rounded-[18px] px-3 py-3 text-sm transition",
                active
                  ? "bg-[var(--color-panel-dark)] text-[var(--color-paper)]"
                  : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-strong)] hover:text-[var(--color-ink)]",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
