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

  const isActiveLink = (href: string) =>
    href === "/" ? pathname === href : pathname.startsWith(href);

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <Logo size={28} />
      </div>

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

      <LanguageSwitcher className={styles.switcher} variant="segmented" />
    </header>
  );
}
