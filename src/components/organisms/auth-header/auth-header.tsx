"use client";

import { type ChangeEvent } from "react";
import { Logo } from "@/components/logo";
import { useLocale } from "@/components/providers/locale-provider";
import { localeLabels, locales, type Locale } from "@/i18n/config";
import styles from "./auth-header.module.css";

export function AuthHeader() {
  const { locale, messages, setLocale } = useLocale();

  function handleLocaleChange(event: ChangeEvent<HTMLSelectElement>) {
    setLocale(event.target.value as Locale);
  }

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <Logo size={28} />
      </div>

      <label className={styles.localeLabel}>
        <span className={styles.visuallyHidden}>Language</span>
        <select
          className={styles.localeSelect}
          aria-label={messages.languageSwitcherAriaLabel}
          value={locale}
          onChange={handleLocaleChange}
        >
          {locales.map((entry) => (
            <option key={entry} value={entry}>
              {localeLabels[entry]}
            </option>
          ))}
        </select>
      </label>
    </header>
  );
}
