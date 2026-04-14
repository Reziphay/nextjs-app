"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Languages } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { localeLabels, localeNames, locales } from "@/i18n/config";
import styles from "./language-switcher.module.css";

type LanguageSwitcherProps = {
  className?: string;
  variant?: "compact" | "panel";
};

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

export function LanguageSwitcher({
  className,
  variant = "compact",
}: LanguageSwitcherProps) {
  const { locale, messages, setLocale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (variant !== "panel" || !isOpen) {
      return undefined;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, variant]);

  if (variant === "panel") {
    return (
      <div
        ref={rootRef}
        className={joinClassNames(styles.panel, className)}
        data-open={isOpen ? "" : undefined}
      >
        <button
          type="button"
          className={styles.panelTrigger}
          aria-label={`${messages.languageSwitcherDisplayLabel}: ${localeNames[locale]}`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          onClick={() => setIsOpen((open) => !open)}
        >
          <span className={styles.panelLead}>
            <span className={styles.panelIconWrap} aria-hidden="true">
              <Languages size={18} />
            </span>
            <span className={styles.panelText}>
              <span className={styles.panelDisplayLabel}>
                {messages.languageSwitcherDisplayLabel}:
              </span>
              <span className={styles.panelCurrentValue}>
                {localeNames[locale]}
              </span>
            </span>
          </span>
          <ChevronDown
            aria-hidden="true"
            size={18}
            className={`${styles.panelChevron} ${
              isOpen ? styles.panelChevronOpen : ""
            }`}
          />
        </button>

        {isOpen ? (
          <div
            className={styles.panelMenu}
            role="listbox"
            aria-label={messages.languageSwitcherAriaLabel}
          >
            {locales.map((entry) => {
              const isActive = entry === locale;

              return (
                <button
                  key={entry}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={`${styles.panelOption} ${
                    isActive ? styles.panelOptionActive : ""
                  }`}
                  onClick={() => {
                    setLocale(entry);
                    setIsOpen(false);
                  }}
                >
                  <span className={styles.panelOptionCode}>
                    {localeLabels[entry]}
                  </span>
                  <span className={styles.panelOptionName}>
                    {localeNames[entry]}
                  </span>
                  <span className={styles.panelOptionCheck} aria-hidden="true">
                    {isActive ? <Check size={16} /> : null}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  }

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
