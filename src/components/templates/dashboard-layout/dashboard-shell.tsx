"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/organisms/app-sidebar";
import { useLocale } from "@/components/providers/locale-provider";
import { getLocaleDirection } from "@/i18n/config";
import { DashboardBottomNav } from "./dashboard-bottom-nav";
import { DashboardHeader } from "./dashboard-header";
import styles from "./dashboard-layout.module.css";

export type ContentVariant = "default" | "full";

type DashboardShellProps = {
  children: ReactNode;
  contentVariant?: ContentVariant;
};

export function DashboardShell({ children, contentVariant = "default" }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { locale } = useLocale();
  const contentDirection = getLocaleDirection(locale);
  const pathname = usePathname();

  // Close mobile sidebar on route change
  useEffect(() => {
    queueMicrotask(() => setMobileOpen(false));
  }, [pathname]);

  function handleToggle() {
    if (window.innerWidth <= 1024) {
      setMobileOpen((v) => !v);
    } else {
      setCollapsed((v) => !v);
    }
  }

  return (
    <div
      className={styles.layout}
      data-locale={locale}
      data-content-direction={contentDirection}
      dir={contentDirection === "rtl" ? "ltr" : undefined}
    >
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className={styles.backdrop}
          aria-hidden
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className={styles.sidebarWrap}>
        <AppSidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />
      </div>

      <div className={styles.body} data-variant={contentVariant}>
        <DashboardHeader
          collapsed={collapsed}
          onToggle={handleToggle}
        />
        <main className={styles.main}>
          <div className={styles.content}>{children}</div>
        </main>
        <DashboardBottomNav />
      </div>
    </div>
  );
}
