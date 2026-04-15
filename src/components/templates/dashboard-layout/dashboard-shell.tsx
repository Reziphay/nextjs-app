"use client";

import { useState, type ReactNode } from "react";
import { AppSidebar } from "@/components/organisms/app-sidebar";
import { useLocale } from "@/components/providers/locale-provider";
import { getLocaleDirection } from "@/i18n/config";
import { DashboardBottomNav } from "./dashboard-bottom-nav";
import { DashboardHeader } from "./dashboard-header";
import styles from "./dashboard-layout.module.css";

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { locale } = useLocale();
  const contentDirection = getLocaleDirection(locale);

  return (
    <div
      className={styles.layout}
      data-locale={locale}
      data-content-direction={contentDirection}
      dir={contentDirection === "rtl" ? "ltr" : undefined}
    >
      <div className={styles.sidebarWrap}>
        <AppSidebar collapsed={collapsed} />
      </div>

      <div className={styles.body}>
        <DashboardHeader
          collapsed={collapsed}
          onToggle={() => setCollapsed((value) => !value)}
        />
        <main className={styles.main}>
          <div className={styles.content}>{children}</div>
        </main>
        <DashboardBottomNav />
      </div>
    </div>
  );
}
