"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import { LanguageSwitcher } from "@/components/molecules";
import { useLocale } from "@/components/providers/locale-provider";
import { clearAuthCookies } from "@/lib/auth-cookies";
import { signOut } from "@/store/auth";
import { useAppDispatch } from "@/store/hooks";
import styles from "./dashboard-header.module.css";

type DashboardHeaderProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export function DashboardHeader({ collapsed, onToggle }: DashboardHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { messages } = useLocale();
  const db = messages.dashboard;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);
  const settingsWrapRef = useRef<HTMLDivElement>(null);

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

  function handleConfirmSignOut() {
    clearAuthCookies();
    dispatch(signOut());
    setSignOutDialogOpen(false);
    setSettingsOpen(false);
    router.replace("/auth/login");
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

      <div className={styles.right}>
        <Link
          href="/contact"
          aria-label={db.support}
          title={db.support}
          className={styles.supportLink}
        >
          <span className={`material-symbols-rounded ${styles.supportIcon}`}>
            help
          </span>
        </Link>

        <div ref={settingsWrapRef} className={styles.settingsWrap}>
          <button
            type="button"
            aria-label={db.settings}
            aria-expanded={settingsOpen}
            aria-haspopup="dialog"
            title={db.settings}
            className={styles.settingsTrigger}
            onClick={() => setSettingsOpen((open) => !open)}
          >
            <span className={`material-symbols-rounded ${styles.supportIcon}`}>
              settings
            </span>
          </button>

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
                <span className={styles.settingsLabel}>
                  {messages.languageSwitcherAriaLabel}
                </span>
                <LanguageSwitcher variant="compact" />
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
