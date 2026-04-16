"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/atoms";
import { Logo } from "@/components/logo";
import {
  LanguageSwitcher,
  ThemeSwitcher,
  UserAvatar,
} from "@/components/molecules";
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

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isMenuOpen]);

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
        <ThemeSwitcher className={styles.switcher} />
        <LanguageSwitcher className={styles.switcher} />

        <div className={styles.authActions}>
          {isAuthenticated ? (
            <Link href={defaultAppHref} className={styles.avatarLink}>
              <UserAvatar
                initials={initials}
                src={user?.avatar_url ?? null}
                alt={
                  user
                    ? `${user.first_name} ${user.last_name} — ${messages.profile.photoAlt}`
                    : messages.profile.photoAlt
                }
                size="md"
                className={styles.headerAvatar}
              />
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
        aria-hidden={!isMenuOpen}
        className={`${styles.mobileBackdrop} ${
          isMenuOpen ? styles.mobileBackdropOpen : ""
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      <div
        id="auth-mobile-menu"
        className={`${styles.mobilePanel} ${
          isMenuOpen ? styles.mobilePanelOpen : ""
        }`}
      >
        <div className={styles.mobilePanelHeader}>
          <Link
            className={styles.mobileBrand}
            href="/"
            onClick={() => setIsMenuOpen(false)}
          >
            <Logo size={28} />
            <span className={styles.mobileBrandName}>Reziphay</span>
          </Link>

          <Button
            aria-label={messages.navigation.closeMenu}
            className={styles.mobileCloseButton}
            icon="close"
            size="medium"
            variant="icon"
            onClick={() => setIsMenuOpen(false)}
          />
        </div>

        <div className={styles.mobilePanelContent}>
          <ThemeSwitcher className={styles.mobileSwitcher} variant="panel" />
          <LanguageSwitcher className={styles.mobileSwitcher} variant="panel" />

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
                    isActiveLink(registerHref)
                      ? styles.mobileAuthButtonActive
                      : ""
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
      </div>
    </header>
  );
}
