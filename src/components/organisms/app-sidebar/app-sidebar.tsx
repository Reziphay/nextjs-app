"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { selectAuthSession } from "@/store/auth";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/atoms/button";
import { Logo } from "@/components/logo";
import { Icon } from "@/components/icon";
import { UserAvatar } from "@/components/molecules/user-avatar/user-avatar";
import {
  getDefaultAppRouteForUserType,
  getSidebarRoutesForUserType,
} from "@/lib/app-routes";
import { fetchMyBrands } from "@/lib/brands-api";
import { fetchMyServices } from "@/lib/services-api";
import type { Brand } from "@/types/brand";
import type { Service } from "@/types/service";
import styles from "./app-sidebar.module.css";

type AppSidebarProps = {
  collapsed: boolean;
  mobileOpen?: boolean;
  onClose?: () => void;
};

type SidebarSubItem = {
  id: string;
  label: string;
  href: string;
  status?: string;
  icon?: string;
  branches: { id: string; label: string; href: string }[];
};

export function AppSidebar({ collapsed, mobileOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { messages } = useLocale();
  const session = useAppSelector(selectAuthSession);
  const db = messages.dashboard;

  const user = session.user;
  const accessToken = session.accessToken;
  const defaultHref = getDefaultAppRouteForUserType(user?.type);
  const platformNav = user ? getSidebarRoutesForUserType(messages, user.type) : [];
  const initials = user
    ? `${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`.toUpperCase()
    : "?";

  const typeLabel: Record<string, string> = {
    uso: db.typeUso,
    ucr: db.typeUcr,
    admin: db.typeAdmin,
  };

  // Sub-data
  const [brands, setBrands] = useState<Brand[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  function loadSidebarData() {
    if (!user || !accessToken || user.type !== "uso") return;
    fetchMyBrands(accessToken).then(setBrands).catch(() => setBrands([]));
    fetchMyServices(accessToken).then(setServices).catch(() => setServices([]));
  }

  useEffect(() => {
    loadSidebarData();
  }, [user, accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = () => loadSidebarData();
    window.addEventListener("reziphay:services-changed", handler);
    window.addEventListener("reziphay:brands-changed", handler);
    return () => {
      window.removeEventListener("reziphay:services-changed", handler);
      window.removeEventListener("reziphay:brands-changed", handler);
    };
  }, [user, accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  // Expanded sub-menu state — auto-follows route
  const [expandedKey, setExpandedKey] = useState<string | null>(() => {
    if (user?.type === "ucr" && (pathname === "/home" || pathname.startsWith("/services") || pathname.startsWith("/brands"))) return "home";
    if (pathname.startsWith("/brands")) return "brands";
    if (pathname.startsWith("/services")) return "services";
    return null;
  });

  useEffect(() => {
    queueMicrotask(() => {
      if (user?.type === "ucr" && (pathname === "/home" || pathname.startsWith("/services") || pathname.startsWith("/brands"))) setExpandedKey("home");
      else if (pathname.startsWith("/brands")) setExpandedKey("brands");
      else if (pathname.startsWith("/services")) setExpandedKey("services");
    });
  }, [pathname, user?.type]);

  function isActive(href: string) {
    return href === "/home" ? pathname === href : pathname.startsWith(href);
  }

  function getSubItems(href: string): SidebarSubItem[] {
    if (user?.type === "ucr" && href === "/home") {
      return [
        {
          id: "marketplace-services",
          label: messages.dashboard.services,
          href: "/services",
          icon: "room_service",
          branches: [],
        },
        {
          id: "marketplace-brands",
          label: messages.dashboard.brands,
          href: "/brands",
          icon: "sell",
          branches: [],
        },
      ];
    }
    if (href === "/brands") return brands.map((b) => ({
      id: b.id,
      label: b.name,
      href: `/brands?id=${b.id}`,
      status: b.status,
      branches: (b.branches ?? []).map((br) => ({ id: br.id, label: br.name, href: `/brands?id=${b.id}` })),
    }));
    if (href === "/services") return services.map((s) => ({
      id: s.id,
      label: s.title,
      href: `/services?id=${s.id}`,
      status: s.status,
      branches: [] as { id: string; label: string; href: string }[],
    }));
    return [];
  }

  function getBadgeCount(href: string): number | null {
    if (href === "/brands" && brands.length > 0) return brands.length;
    if (href === "/services" && services.length > 0) return services.length;
    return null;
  }

  function isSubActive(subHref: string): boolean {
    if (!subHref.includes("?")) return pathname === subHref;
    const subId = new URLSearchParams(subHref.split("?")[1] ?? "").get("id");
    return searchParams.get("id") === subId;
  }

  function handleNavClick(href: string) {
    const subKey = user?.type === "ucr" && href === "/home"
      ? "home"
      : href === "/brands"
        ? "brands"
        : href === "/services"
          ? "services"
          : null;
    if (subKey) {
      if (expandedKey === subKey && isActive(href)) {
        setExpandedKey(null);
      } else {
        setExpandedKey(subKey);
        router.push(href);
      }
    } else {
      onClose?.();
      router.push(href);
    }
  }

  return (
    <aside
      className={[
        styles.sidebar,
        collapsed ? styles.sidebarCollapsed : "",
        mobileOpen ? styles.sidebarMobileOpen : "",
      ].filter(Boolean).join(" ")}
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
            {platformNav.map((item) => {
              const active = isActive(item.href);
              const subItems = getSubItems(item.href);
              const hasSubItems = subItems.length > 0;
              const groupKey = user?.type === "ucr" && item.href === "/home"
                ? "home"
                : item.href === "/brands"
                  ? "brands"
                  : "services";
              const isExpanded = expandedKey === groupKey;
              const badge = getBadgeCount(item.href);

              return (
                <div key={item.href} className={styles.navGroup}>
                  <Button
                    variant="unstyled"
                    type="button"
                    aria-current={active ? "page" : undefined}
                    className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
                    onClick={() => handleNavClick(item.href)}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className={styles.navIconWrap}>
                      <Icon icon={item.icon} size={16} color="current" className={styles.navIcon} />
                      {badge !== null && !collapsed && (
                        <span className={`${styles.badge} ${active ? styles.badgeActive : ""}`}>
                          {badge > 99 ? "99+" : badge}
                        </span>
                      )}
                      {badge !== null && collapsed && (
                        <span className={`${styles.badgeDot} ${active ? styles.badgeDotActive : ""}`} />
                      )}
                    </span>
                    <span className={styles.navLabel}>{item.label}</span>
                    {hasSubItems && !collapsed && (
                      <Icon
                        icon="chevron_right"
                        size={14}
                        color="current"
                        className={`${styles.chevronIcon} ${isExpanded ? styles.chevronExpanded : ""}`}
                      />
                    )}
                  </Button>

                  {/* Sub-items */}
                  {hasSubItems && isExpanded && !collapsed && (
                    <div className={styles.subNav}>
                      {subItems.map((sub) => (
                        <div key={sub.id} className={styles.subGroup}>
                          <Link
                            href={sub.href}
                            className={`${styles.subItem} ${isSubActive(sub.href) ? styles.subItemActive : ""}`}
                            onClick={onClose}
                          >
                            {sub.icon ? (
                              <Icon icon={sub.icon} size={13} color="current" className={styles.subIcon} />
                            ) : (
                              <span
                                className={`${styles.subDot} ${
                                  sub.status === "ACTIVE"
                                    ? styles.subDotActive
                                    : sub.status === "PENDING"
                                    ? styles.subDotPending
                                    : sub.status === "REJECTED"
                                    ? styles.subDotRejected
                                    : styles.subDotNeutral
                                }`}
                              />
                            )}
                            <span className={styles.subLabel}>{sub.label}</span>
                          </Link>
                          {sub.branches && sub.branches.length > 0 && (
                            <div className={styles.branchNav}>
                              {sub.branches.map((br) => (
                                <Link
                                  key={br.id}
                                  href={br.href}
                                  className={styles.branchItem}
                                  onClick={onClose}
                                >
                                  <span className={styles.branchLabel}>{br.label}</span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.userRow}>
          <Button
            variant="unstyled"
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
          </Button>
        </div>
      </div>
    </aside>
  );
}
