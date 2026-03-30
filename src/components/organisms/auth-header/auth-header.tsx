"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/molecules";
import { useLocale } from "@/components/providers/locale-provider";
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
  const loginHref = "/auth/login";
  const registerHref = "/auth/register";

  const isActiveLink = (href: string) =>
    href === "/" ? pathname === href : pathname.startsWith(href);

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
        {navigationLinks.map((link) => (
          <Link
            key={link.href}
            aria-current={isActiveLink(link.href) ? "page" : undefined}
            className={`${styles.navigationLink} ${
              isActiveLink(link.href) ? styles.navigationLinkActive : ""
            }`}
            href={link.href}
          >
            {messages.navigation[link.key]}
          </Link>
        ))}
      </nav>

      <div className={styles.actions}>
        <LanguageSwitcher className={styles.switcher} variant="dropdown" />

        <div className={styles.authActions}>
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
        </div>
      </div>
    </header>
  );
}
