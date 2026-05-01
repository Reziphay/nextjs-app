"use client";

import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { useLocale } from "@/components/providers/locale-provider";
import { useTheme } from "@/components/providers/theme-provider";
import {
  themePreferences,
  type ThemePreference,
} from "@/theme/theme-config";
import styles from "./theme-switcher.module.css";

type ThemeSwitcherProps = {
  className?: string;
  variant?: "compact" | "panel";
};

const themeIcons: Record<ThemePreference, LucideIcon> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

export function ThemeSwitcher({
  className,
  variant = "compact",
}: ThemeSwitcherProps) {
  const { messages } = useLocale();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const copy = messages.theme;
  const labels: Record<ThemePreference, string> = {
    system: copy.system,
    light: copy.light,
    dark: copy.dark,
  };

  return (
    <div
      className={joinClassNames(
        styles.root,
        variant === "compact" ? styles.compact : styles.panel,
        className,
      )}
    >
      {variant === "panel" ? (
        <div className={styles.header}>
          <p className={styles.title}>{copy.title}</p>
          <span className={styles.status}>{labels[resolvedTheme]}</span>
        </div>
      ) : null}

      <div className={styles.group} role="radiogroup" aria-label={copy.title}>
        {themePreferences.map((option) => {
          const Icon = themeIcons[option];
          const isActive = option === theme;

          return (
            <Button
              variant="unstyled"
              key={option}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={`${copy.title}: ${labels[option]}`}
              title={labels[option]}
              className={`${styles.option} ${isActive ? styles.optionActive : ""}`}
              onClick={() => setTheme(option)}
            >
              <span className={styles.optionIcon} aria-hidden="true">
                <Icon size={variant === "compact" ? 16 : 18} />
              </span>
              {variant === "panel" ? (
                <span className={styles.optionLabel}>{labels[option]}</span>
              ) : null}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
