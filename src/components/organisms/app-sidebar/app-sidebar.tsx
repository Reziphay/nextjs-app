"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { signOut, selectAuthSession } from "@/store/auth";
import { useLocale } from "@/components/providers/locale-provider";
import { Logo } from "@/components/logo";
import styles from "./app-sidebar.module.css";

const platformNav = [
  { href: "/home", key: "home" as const, icon: "home" },
  { href: "/home/profile", key: "profile" as const, icon: "person" },
  { href: "/home/settings", key: "settings" as const, icon: "settings" },
] as const;

type AppSidebarProps = {
  collapsed: boolean;
  onClose?: () => void;
};

export function AppSidebar({ collapsed, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { messages } = useLocale();
  const session = useAppSelector(selectAuthSession);
  const db = messages.dashboard;

  const user = session.user;
  const initials = user
    ? `${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`.toUpperCase()
    : "?";

  const typeLabel: Record<string, string> = {
    uso: db.typeUso,
    ucr: db.typeUcr,
    admin: db.typeAdmin,
  };

  function handleSignOut() {
    dispatch(signOut());
    onClose?.();
    router.replace("/auth/login");
  }

  function isActive(href: string) {
    return href === "/home" ? pathname === href : pathname.startsWith(href);
  }

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}
    >
      {/* Brand */}
      <div className={styles.brand}>
        <Link href="/home" className={styles.brandLink}>
          <span className={styles.brandIcon}>
            <Logo size={22} />
          </span>
          <span className={styles.brandText}>
            <span className={styles.brandName}>Reziphay</span>
            <span className={styles.brandSub}>
              {user ? (typeLabel[user.type] ?? user.type) : ""}
            </span>
          </span>
        </Link>
      </div>

      {/* Main scroll area */}
      <div className={styles.scrollArea}>
        <div className={styles.section}>
          <p className={styles.sectionLabel}>{db.platform}</p>
          <nav className={styles.nav}>
            {platformNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? db[item.key] : undefined}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`${styles.navItem} ${isActive(item.href) ? styles.navItemActive : ""}`}
                onClick={onClose}
              >
                <span className={`material-symbols-rounded ${styles.navIcon}`}>
                  {item.icon}
                </span>
                <span className={styles.navLabel}>{db[item.key]}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <nav className={styles.footerNav}>
          <Link
            href="/contact"
            title={collapsed ? db.support : undefined}
            className={styles.footerItem}
          >
            <span className={`material-symbols-rounded ${styles.navIcon}`}>help</span>
            <span className={styles.navLabel}>{db.support}</span>
          </Link>
          <Link
            href="/contact"
            title={collapsed ? db.feedback : undefined}
            className={styles.footerItem}
          >
            <span className={`material-symbols-rounded ${styles.navIcon}`}>send</span>
            <span className={styles.navLabel}>{db.feedback}</span>
          </Link>
        </nav>

        <div className={styles.divider} />

        <div className={styles.userRow}>
          <button
            type="button"
            title={collapsed ? `${user?.first_name} ${user?.last_name}` : undefined}
            className={styles.userBtn}
            onClick={() => router.push("/home/profile")}
          >
            <span className={styles.avatar}>{initials}</span>
            <span className={styles.userInfo}>
              <span className={styles.userName}>
                {user ? `${user.first_name} ${user.last_name}` : ""}
              </span>
              <span className={styles.userEmail}>{user?.email ?? ""}</span>
            </span>
            <span className={`material-symbols-rounded ${styles.chevron}`}>
              unfold_more
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
