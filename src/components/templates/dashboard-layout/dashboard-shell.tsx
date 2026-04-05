"use client";

import { useState, type ReactNode } from "react";
import { AppSidebar } from "@/components/organisms/app-sidebar";
import { DashboardBottomNav } from "./dashboard-bottom-nav";
import { DashboardHeader } from "./dashboard-header";
import styles from "./dashboard-layout.module.css";

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={styles.layout}>
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
