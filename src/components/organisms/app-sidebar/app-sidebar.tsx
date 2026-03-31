"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { signOut, selectAuthSession } from "@/store/auth";
import { useLocale } from "@/components/providers/locale-provider";
import { Logo } from "@/components/logo";
import styles from "./app-sidebar.module.css";

const navItems = [
  { href: "/home", key: "home" as const, icon: "home" },
  { href: "/home/profile", key: "profile" as const, icon: "person" },
] as const;

export function AppSidebar() {
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

  function handleSignOut() {
    dispatch(signOut());
    router.replace("/auth/login");
  }

  function isActive(href: string) {
    return href === "/home" ? pathname === href : pathname.startsWith(href);
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.top}>
        <Link className={styles.brand} href="/home">
          <Logo size={28} />
        </Link>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`${styles.navItem} ${isActive(item.href) ? styles.navItemActive : ""}`}
            >
              <span className={`${styles.navIcon} material-symbols-rounded`}>
                {item.icon}
              </span>
              <span className={styles.navLabel}>{db[item.key]}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className={styles.bottom}>
        <Link href="/home/profile" className={styles.userRow}>
          <span className={styles.avatar}>{initials}</span>
          <span className={styles.userInfo}>
            <span className={styles.userName}>
              {user ? `${user.first_name} ${user.last_name}` : ""}
            </span>
            <span className={styles.userEmail}>{user?.email ?? ""}</span>
          </span>
        </Link>

        <button
          type="button"
          className={styles.signOutBtn}
          onClick={handleSignOut}
        >
          <span className={`${styles.navIcon} material-symbols-rounded`}>logout</span>
          <span className={styles.navLabel}>{db.signOut}</span>
        </button>
      </div>
    </aside>
  );
}
