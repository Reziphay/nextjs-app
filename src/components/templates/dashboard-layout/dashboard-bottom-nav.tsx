"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserAvatar } from "@/components/molecules";
import { useLocale } from "@/components/providers/locale-provider";
import { selectAuthSession } from "@/store/auth";
import { useAppSelector } from "@/store/hooks";
import { getSidebarRoutesForUserType } from "@/lib/app-routes";
import styles from "./dashboard-bottom-nav.module.css";

export function DashboardBottomNav() {
  const pathname = usePathname();
  const session = useAppSelector(selectAuthSession);
  const { messages } = useLocale();

  const user = session.user;

  if (!user) {
    return null;
  }

  const items = [
    ...getSidebarRoutesForUserType(messages, user.type).filter(
      (item) => item.href !== "/settings",
    ),
    {
      href: "/account",
      icon: "account_circle",
      label: messages.dashboard.account,
    },
  ];
  const initials = `${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`.toUpperCase();

  return (
    <nav aria-label={messages.dashboard.platform} className={styles.nav}>
      <div className={styles.inner}>
        {items.map((item) => {
          const isAccountItem = item.href === "/account";
          const isActive =
            item.href === "/home"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={`${styles.item} ${isActive ? styles.itemActive : ""}`}
            >
              {isAccountItem && user.avatar_url ? (
                <UserAvatar
                  initials={initials}
                  src={user.avatar_url}
                  alt={`${user.first_name} ${user.last_name} — ${messages.profile.photoAlt}`}
                  size="sm"
                  className={styles.avatar}
                  surfaceClassName={styles.avatarSurface}
                />
              ) : (
                <span className={`material-symbols-rounded ${styles.icon}`}>
                  {item.icon}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
