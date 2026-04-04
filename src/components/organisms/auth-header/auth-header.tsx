"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/atoms";
import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/molecules";
import { useLocale } from "@/components/providers/locale-provider";
import {
  getDefaultAppRouteForUserType,
  getProtectedRouteLabel,
} from "@/lib/app-routes";
import { useAppSelector } from "@/store/hooks";
import { selectAuthSession, selectIsAuthenticated } from "@/store/auth";
import styles from "./auth-header.module.css";

const navigationLinks = [
  { href: "/", key: "home" },
  { href: "/about", key: "aboutUs" },
  { href: "/questions", key: "questions" },
  { href: "/contact", key: "contactUs" },
] as const;

export function AuthHeader() {
  const pathname = usePathname();
  const { messages } = useLocale();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const session = useAppSelector(selectAuthSession);
  const loginHref = "/auth/login";
  const registerHref = "/auth/register";

  const user = session.user;
  const defaultAppHref = getDefaultAppRouteForUserType(user?.type);
  const defaultAppLabel = getProtectedRouteLabel(messages, defaultAppHref);
  const initials = user
    ? `${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`.toUpperCase()
    : "";

  const isActiveLink = (href: string) =>
    href === "/" ? pathname === href : pathname.startsWith(href);

  function renderNavigationItems(onItemClick?: () => void) {
    return navigationLinks.map((link) => (
      <Link
        key={link.href}
        aria-current={isActiveLink(link.href) ? "page" : undefined}
        className={`${styles.navigationLink} ${
          isActiveLink(link.href) ? styles.navigationLinkActive : ""
        }`}
        href={link.href}
        onClick={onItemClick}
      >
        {messages.navigation[link.key]}
      </Link>
    ));
  }

  return (
    <header className={styles.header}>
      <Link className={styles.brand} href="/">
        <Logo size={28} />
        <span className={styles.brandName}>Reziphay</span>
      </Link>

      <nav
        aria-label={messages.navigationAriaLabel}
        className={styles.navigation}
      >
        {renderNavigationItems()}
      </nav>

      <div className={styles.actions}>
        <LanguageSwitcher className={styles.switcher} variant="compact" />

        <div className={styles.authActions}>
          {isAuthenticated ? (
            <Link href={defaultAppHref} className={styles.avatarLink}>
              <span className={styles.avatar}>{initials}</span>
            </Link>
          ) : (
            <>
              <Link
                aria-current={isActiveLink(loginHref) ? "page" : undefined}
                className={`${styles.authLink} ${
                  isActiveLink(loginHref) ? styles.authLinkActive : ""
                }`}
                href={loginHref}
              >
                {messages.auth.login.submit}
              </Link>

              <Link
                aria-current={isActiveLink(registerHref) ? "page" : undefined}
                className={`${styles.authButton} ${
                  isActiveLink(registerHref) ? styles.authButtonActive : ""
                }`}
                href={registerHref}
              >
                {messages.auth.login.signUp}
              </Link>
            </>
          )}
        </div>
      </div>

      <div className={styles.mobileToggle}>
        <Button
          aria-controls="auth-mobile-menu"
          aria-expanded={isMenuOpen}
          aria-label={
            isMenuOpen
              ? messages.navigation.closeMenu
              : messages.navigation.openMenu
          }
          className={styles.menuButton}
          icon={isMenuOpen ? "close" : "menu"}
          size="medium"
          variant="icon"
          onClick={() => setIsMenuOpen((previousValue) => !previousValue)}
        />
      </div>

      <div
        id="auth-mobile-menu"
        className={`${styles.mobilePanel} ${
          isMenuOpen ? styles.mobilePanelOpen : ""
        }`}
      >
        <LanguageSwitcher className={styles.mobileSwitcher} variant="compact" />

        <nav
          aria-label={messages.navigationAriaLabel}
          className={styles.mobileNavigation}
        >
          {renderNavigationItems(() => setIsMenuOpen(false))}
        </nav>

        <div className={styles.mobileAuthActions}>
          {isAuthenticated ? (
            <Link
              href={defaultAppHref}
              className={styles.mobileAuthButton}
              onClick={() => setIsMenuOpen(false)}
            >
              {defaultAppLabel}
            </Link>
          ) : (
            <>
              <Link
                aria-current={isActiveLink(loginHref) ? "page" : undefined}
                className={`${styles.mobileAuthLink} ${
                  isActiveLink(loginHref) ? styles.mobileAuthLinkActive : ""
                }`}
                href={loginHref}
                onClick={() => setIsMenuOpen(false)}
              >
                {messages.auth.login.submit}
              </Link>

              <Link
                aria-current={isActiveLink(registerHref) ? "page" : undefined}
                className={`${styles.mobileAuthButton} ${
                  isActiveLink(registerHref) ? styles.mobileAuthButtonActive : ""
                }`}
                href={registerHref}
                onClick={() => setIsMenuOpen(false)}
              >
                {messages.auth.login.signUp}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
