"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { selectAuthSession } from "@/store/auth";
import { useLocale } from "@/components/providers/locale-provider";
import { Logo } from "@/components/logo";
import { Icon } from "@/components/icon";
import { UserAvatar } from "@/components/molecules/user-avatar/user-avatar";
import {
  getDefaultAppRouteForUserType,
  getSidebarRoutesForUserType,
} from "@/lib/app-routes";
import styles from "./app-sidebar.module.css";

type AppSidebarProps = {
  collapsed: boolean;
  onClose?: () => void;
};

export function AppSidebar({ collapsed, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { messages } = useLocale();
  const session = useAppSelector(selectAuthSession);
  const db = messages.dashboard;

  const user = session.user;
  const defaultHref = getDefaultAppRouteForUserType(user?.type);
  const platformNav = user
    ? getSidebarRoutesForUserType(messages, user.type)
    : [];
  const initials = user
    ? `${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`.toUpperCase()
    : "?";

  const typeLabel: Record<string, string> = {
    uso: db.typeUso,
    ucr: db.typeUcr,
    admin: db.typeAdmin,
  };

  function isActive(href: string) {
    return href === "/home" ? pathname === href : pathname.startsWith(href);
  }

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}
    >
      {/* Brand */}
      <div className={styles.brand}>
        <Link href={defaultHref} className={styles.brandLink}>
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
                title={collapsed ? item.label : undefined}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`${styles.navItem} ${isActive(item.href) ? styles.navItemActive : ""}`}
                onClick={onClose}
              >
                <Icon icon={item.icon} size={16} color="current" className={styles.navIcon} />
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.userRow}>
          <button
            type="button"
            title={collapsed ? `${user?.first_name} ${user?.last_name}` : undefined}
            className={styles.userBtn}
            onClick={() => router.push("/account")}
          >
            <UserAvatar
              initials={initials}
              src={user?.avatar_url ?? null}
              alt={
                user
                  ? `${user.first_name} ${user.last_name} — ${messages.profile.photoAlt}`
                  : messages.profile.photoAlt
              }
              size="sm"
              className={styles.userAvatar}
            />
            <span className={styles.userInfo}>
              <span className={styles.userName}>
                {user ? `${user.first_name} ${user.last_name}` : ""}
              </span>
              <span className={styles.userEmail}>{user?.email ?? ""}</span>
            </span>
            <Icon icon="unfold_more" size={14} color="current" className={styles.chevron} />
          </button>
        </div>
      </div>
    </aside>
  );
}
