"use client";

import { useLocale } from "@/components/providers/locale-provider";
import { localeLabels, localeNames, locales } from "@/i18n/config";
import styles from "./language-switcher.module.css";

type LanguageSwitcherProps = {
  className?: string;
};

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

export function LanguageSwitcher({
  className,
}: LanguageSwitcherProps) {
  const { locale, messages, setLocale } = useLocale();

  return (
    <div
      className={joinClassNames(styles.compact, className)}
      role="group"
      aria-label={messages.languageSwitcherAriaLabel}
    >
      {locales.map((entry) => {
        const isActive = entry === locale;

        return (
          <button
            key={entry}
            type="button"
            className={`${styles.compactButton} ${
              isActive ? styles.compactButtonActive : ""
            }`}
            aria-label={`${messages.languageSwitcherAriaLabel}: ${localeNames[entry]}`}
            aria-pressed={isActive}
            title={localeNames[entry]}
            onClick={() => setLocale(entry)}
          >
            {localeLabels[entry]}
          </button>
        );
      })}
    </div>
  );
}
