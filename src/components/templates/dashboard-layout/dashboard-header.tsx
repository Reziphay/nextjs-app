"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/providers/locale-provider";
import styles from "./dashboard-header.module.css";

type DashboardHeaderProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export function DashboardHeader({ collapsed, onToggle }: DashboardHeaderProps) {
  const pathname = usePathname();
  const { messages } = useLocale();
  const db = messages.dashboard;

  const crumbMap: Record<string, string> = {
    "/home": db.home,
    "/home/profile": db.profile,
    "/home/settings": db.settings,
  };

  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];
  let current = "";
  for (const seg of segments) {
    current += `/${seg}`;
    if (crumbMap[current]) {
      crumbs.push({ label: crumbMap[current], href: current });
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Sidebar aç" : "Sidebar bağla"}
          className={styles.toggleBtn}
        >
          <span className={`material-symbols-rounded ${styles.toggleIcon} ${collapsed ? styles.toggleIconCollapsed : ""}`}>
            left_panel_open
          </span>
        </button>

        <div className={styles.separator} />

        <nav aria-label="breadcrumb" className={styles.breadcrumb}>
          {crumbs.map((crumb, i) => (
            <span key={crumb.href} className={styles.crumbItem}>
              {i > 0 && (
                <span className={`material-symbols-rounded ${styles.crumbSep}`}>
                  chevron_right
                </span>
              )}
              {i < crumbs.length - 1 ? (
                <Link href={crumb.href} className={styles.crumbLink}>
                  {crumb.label}
                </Link>
              ) : (
                <span className={styles.crumbCurrent}>{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </header>
  );
}
