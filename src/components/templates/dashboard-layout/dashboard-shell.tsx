"use client";

import { useState, type ReactNode } from "react";
import { AppSidebar } from "@/components/organisms/app-sidebar";
import { DashboardHeader } from "./dashboard-header";
import styles from "./dashboard-layout.module.css";

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={styles.layout}>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={`${styles.sidebarWrap} ${mobileOpen ? styles.sidebarWrapOpen : ""}`}
      >
        <AppSidebar
          collapsed={collapsed}
          onClose={() => setMobileOpen(false)}
        />
      </div>

      <div className={styles.body}>
        <DashboardHeader
          collapsed={collapsed}
          onToggle={() => {
            if (window.matchMedia("(max-width: 767px)").matches) {
              setMobileOpen((v) => !v);
            } else {
              setCollapsed((v) => !v);
            }
          }}
        />
        <main className={styles.main}>
          <div className={styles.content}>{children}</div>
        </main>
      </div>
    </div>
  );
}
