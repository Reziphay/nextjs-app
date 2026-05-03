"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  Button,
} from "@/components/atoms";
import { Icon } from "@/components/icon";
import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/molecules/language-switcher/language-switcher";
import { ThemeSwitcher } from "@/components/molecules/theme-switcher/theme-switcher";
import { useLocale } from "@/components/providers/locale-provider";
import {
  getDefaultAppRouteForUserType,
  getDashboardBreadcrumbs,
  isProtectedAppPath,
} from "@/lib/app-routes";
import {
  fetchNotificationFeed,
} from "@/lib/brands-api";
import { clearAuthCookies } from "@/lib/auth-cookies";
import { selectAuthSession, signOut } from "@/store/auth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import styles from "./dashboard-header.module.css";

type DashboardHeaderProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export function DashboardHeader({ collapsed, onToggle }: DashboardHeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const session = useAppSelector(selectAuthSession);
  const { messages } = useLocale();
  const db = messages.dashboard;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);
  const [hasNotificationSignal, setHasNotificationSignal] = useState(false);
  const settingsWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!settingsOpen) {
      return undefined;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!settingsWrapRef.current?.contains(event.target as Node)) {
        setSettingsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSettingsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [settingsOpen]);

  useEffect(() => {
    const accessToken = session.accessToken;

    if (!accessToken) {
      return undefined;
    }

    const activeAccessToken = accessToken;

    let cancelled = false;

    async function loadNotificationSignal() {
      try {
        const feed = await fetchNotificationFeed(activeAccessToken).catch(() => ({
          items: [],
          meta: {
            total_count: 0,
            unread_count: 0,
          },
        }));

        if (cancelled) {
          return;
        }

        setHasNotificationSignal(feed.meta.total_count > 0);
      } catch {
        if (!cancelled) {
          setHasNotificationSignal(false);
        }
      }
    }

    void loadNotificationSignal();

    return () => {
      cancelled = true;
    };
  }, [pathname, session.accessToken]);

  function handleConfirmSignOut() {
    clearAuthCookies();
    dispatch(signOut());
    setSignOutDialogOpen(false);
    setSettingsOpen(false);
    router.replace("/auth/login");
  }

  const notificationsActive = pathname === "/notification";
  const settingsActive = pathname === "/settings";
  const showNotificationBadge =
    !notificationsActive && Boolean(session.accessToken) && hasNotificationSignal;
  const showUcrSearch = session.user?.type === "ucr";
  const defaultHref = getDefaultAppRouteForUserType(session.user?.type);
  const crumbs = isProtectedAppPath(pathname)
    ? getDashboardBreadcrumbs({
        messages,
        pathname,
        searchParams,
        currentUserId: session.user?.id,
      })
    : [];

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link
          href={defaultHref}
          aria-label="Reziphay"
          className={styles.mobileLogo}
        >
          <Logo size={20} />
        </Link>

        <Button
          variant="unstyled"
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? db.openSidebar : db.closeSidebar}
          className={styles.toggleBtn}
        >
          <Icon icon="left_panel_open" size={16} color="current" className={`${styles.toggleIcon} ${collapsed ? styles.toggleIconCollapsed : ""}`} />
        </Button>

        <div className={styles.separator} />

        <nav aria-label={db.breadcrumb} className={styles.breadcrumb}>
          {crumbs.map((crumb, i) => (
            <span key={`${crumb.href ?? "current"}-${crumb.label}-${i}`} className={styles.crumbItem}>
              {i > 0 ? (
                <span aria-hidden="true" className={styles.crumbSep}>
                  /
                </span>
              ) : null}
              {crumb.href && !crumb.current ? (
                <Link href={crumb.href} className={styles.crumbLink} title={crumb.label}>
                  {i === 0 && crumb.icon ? (
                    <Icon icon={crumb.icon} size={14} color="current" className={styles.crumbIcon} />
                  ) : null}
                  <span className={styles.crumbText}>{crumb.label}</span>
                </Link>
              ) : (
                <span className={styles.crumbCurrent}>
                  {i === 0 && crumb.icon ? (
                    <Icon icon={crumb.icon} size={14} color="current" className={styles.crumbIcon} />
                  ) : null}
                  <span className={styles.crumbText}>{crumb.label}</span>
                </span>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className={styles.right}>
        {showUcrSearch ? (
          <Link
            href="/search"
            className={styles.headerSearch}
            aria-label={messages.marketplace.searchPlaceholder}
          >
            <Icon icon="search" size={15} color="current" />
            <span>{messages.marketplace.searchPlaceholder}</span>
          </Link>
        ) : null}

        <Link
          href="/notification"
          aria-label={db.notifications}
          title={db.notifications}
          className={`${styles.supportLink} ${notificationsActive ? styles.iconActionActive : ""}`}
        >
          <span className={styles.iconLinkInner}>
            <Icon icon="notifications" size={16} color="current" className={styles.supportIcon} />
            {showNotificationBadge ? (
              <span className={styles.notificationBadge} aria-hidden />
            ) : null}
          </span>
        </Link>

        <div ref={settingsWrapRef} className={styles.settingsWrap}>
          <Button
            variant="unstyled"
            type="button"
            aria-label={db.settings}
            aria-expanded={settingsOpen}
            aria-haspopup="dialog"
            title={db.settings}
            className={`${styles.settingsTrigger} ${settingsActive || settingsOpen ? styles.iconActionActive : ""}`}
            onClick={() => setSettingsOpen((open) => !open)}
          >
            <Icon icon="settings" size={16} color="current" className={styles.supportIcon} />
          </Button>

          {settingsOpen ? (
            <div
              role="dialog"
              aria-label={db.settings}
              className={styles.settingsPopup}
            >
              <div className={styles.settingsSection}>
                <p className={styles.settingsTitle}>{db.settings}</p>
              </div>

              <div className={styles.settingsSection}>
                <LanguageSwitcher variant="panel" />
              </div>

              <div className={styles.settingsSection}>
                <ThemeSwitcher variant="panel" />
              </div>

              <div className={styles.settingsDivider} />

              <div className={styles.settingsSection}>
                <Button
                  variant="destructive"
                  icon="logout"
                  className={styles.settingsAction}
                  onClick={() => {
                    setSettingsOpen(false);
                    setSignOutDialogOpen(true);
                  }}
                >
                  {db.signOut}
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <AlertDialog
          open={signOutDialogOpen}
          onOpenChange={setSignOutDialogOpen}
        >
          <AlertDialogContent size="sm">
            <AlertDialogMedia tone="destructive">
              <Icon icon="logout" size={28} color="error" />
            </AlertDialogMedia>
            <AlertDialogHeader>
              <AlertDialogTitle>{db.signOutConfirmTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {db.signOutConfirmDescription}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{db.cancel}</AlertDialogCancel>
              <AlertDialogAction
                destructive
                onClick={handleConfirmSignOut}
              >
                {db.confirmSignOut}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </header>
  );
}
