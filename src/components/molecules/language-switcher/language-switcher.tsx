"use client";

import {
  Badge,
  Button,
  Combobox,
  type ComboboxOption,
} from "@/components/atoms";
import { Icon } from "@/components/icon";
import { useLocale } from "@/components/providers/locale-provider";
import {
  isLocale,
  localeLabels,
  localeNames,
  locales,
  type Locale,
} from "@/i18n/config";
import styles from "./language-switcher.module.css";

type LanguageSwitcherVariant = "dropdown" | "segmented" | "compact";

type LanguageSwitcherProps = {
  className?: string;
  variant?: LanguageSwitcherVariant;
};

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

const localeOptions: readonly ComboboxOption[] = locales.map((entry) => ({
  value: entry,
  label: localeNames[entry],
  keywords: [localeLabels[entry], localeNames[entry]],
}));

export function LanguageSwitcher({
  className,
  variant = "dropdown",
}: LanguageSwitcherProps) {
  const { locale, messages, setLocale } = useLocale();

  if (variant === "compact") {
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

  if (variant === "segmented") {
    return (
      <div
        className={joinClassNames(styles.segmented, className)}
        role="group"
        aria-label={messages.languageSwitcherAriaLabel}
      >
        <span className={styles.segmentedIcon} aria-hidden="true">
          <Icon icon="translate" size={18} color="current" />
        </span>

        {locales.map((entry) => {
          const isActive = entry === locale;

          return (
            <Button
              key={entry}
              type="button"
              size="small"
              variant={isActive ? "primary" : "secondary"}
              className={styles.segmentButton}
              aria-label={`${messages.languageSwitcherAriaLabel}: ${localeNames[entry]}`}
              aria-pressed={isActive}
              title={localeNames[entry]}
              onClick={() => setLocale(entry)}
            >
              {localeLabels[entry]}
            </Button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={joinClassNames(styles.dropdownShell, className)}>
      <span className={styles.iconWrap} aria-hidden="true">
        <Icon icon="translate" size={18} color="current" />
      </span>

      <Combobox
        className={styles.dropdown}
        items={localeOptions}
        value={locale}
        placeholder={messages.languageSwitcherAriaLabel}
        aria-label={messages.languageSwitcherAriaLabel}
        onValueChange={(value) => {
          if (typeof value === "string" && isLocale(value)) {
            setLocale(value);
          }
        }}
        renderItem={(item) => {
          const itemLocale = item.value as Locale;

          return (
            <div className={styles.optionRow}>
              <span className={styles.optionLabel}>{item.label}</span>
              <Badge
                className={styles.optionCode}
                variant={itemLocale === locale ? "secondary" : "outline"}
              >
                {localeLabels[itemLocale]}
              </Badge>
            </div>
          );
        }}
      />
    </div>
  );
}
