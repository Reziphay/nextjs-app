"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Languages } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import {
  getLocaleNames,
  localeLabels,
  locales,
} from "@/i18n/config";
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
  const localeNames = getLocaleNames(locale);

  useEffect(() => {
    if (!isOpen) {
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
  }, [isOpen]);

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
      ref={rootRef}
      className={joinClassNames(styles.compact, className)}
      data-open={isOpen ? "" : undefined}
    >
      <button
        type="button"
        className={styles.compactTrigger}
        aria-label={`${messages.languageSwitcherAriaLabel}: ${localeNames[locale]}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title={localeNames[locale]}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className={styles.compactValue}>
          {localeLabels[locale]}
        </span>
        <ChevronDown
          aria-hidden="true"
          size={16}
          className={`${styles.compactChevron} ${
            isOpen ? styles.compactChevronOpen : ""
          }`}
        />
      </button>

      {isOpen ? (
        <div
          className={styles.compactMenu}
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
                className={`${styles.compactOption} ${
                  isActive ? styles.compactOptionActive : ""
                }`}
                onClick={() => {
                  setLocale(entry);
                  setIsOpen(false);
                }}
              >
                <span className={styles.compactOptionCode}>
                  {localeLabels[entry]}
                </span>
                <span className={styles.compactOptionName}>
                  {localeNames[entry]}
                </span>
                <span className={styles.compactOptionCheck} aria-hidden="true">
                  {isActive ? <Check size={15} /> : null}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
