"use client";

import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { useLocale } from "@/components/providers/locale-provider";
import { useTheme } from "@/components/providers/theme-provider";
import type { Locale } from "@/i18n/config";
import {
  themePreferences,
  type ThemePreference,
} from "@/theme/theme-config";
import styles from "./theme-switcher.module.css";

type ThemeSwitcherProps = {
  className?: string;
  variant?: "compact" | "panel";
};

type ThemeCopy = {
  title: string;
  system: string;
  light: string;
  dark: string;
};

const themeCopy: Record<Locale, ThemeCopy> = {
  az: { title: "Tema", system: "Sistem", light: "Açıq", dark: "Tünd" },
  en: { title: "Theme", system: "System", light: "Light", dark: "Dark" },
  ru: { title: "Тема", system: "Система", light: "Светлая", dark: "Тёмная" },
  es: { title: "Tema", system: "Sistema", light: "Claro", dark: "Oscuro" },
  fr: { title: "Thème", system: "Système", light: "Clair", dark: "Sombre" },
  tr: { title: "Tema", system: "Sistem", light: "Light", dark: "Dark" },
  ar: { title: "السمة", system: "النظام", light: "فاتح", dark: "داكن" },
  de: { title: "Thema", system: "System", light: "Hell", dark: "Dunkel" },
  zh: { title: "主题", system: "系统", light: "浅色", dark: "深色" },
  ja: { title: "テーマ", system: "システム", light: "ライト", dark: "ダーク" },
  hi: { title: "थीम", system: "सिस्टम", light: "लाइट", dark: "डार्क" },
  la: { title: "Thema", system: "Systema", light: "Clarum", dark: "Obscurum" },
  fa: { title: "پوسته", system: "سیستم", light: "روشن", dark: "تیره" },
  it: { title: "Tema", system: "Sistema", light: "Chiaro", dark: "Scuro" },
  uk: { title: "Тема", system: "Система", light: "Світла", dark: "Темна" },
  pt: { title: "Tema", system: "Sistema", light: "Claro", dark: "Escuro" },
  he: { title: "ערכת נושא", system: "מערכת", light: "בהיר", dark: "כהה" },
  uz: { title: "Mavzu", system: "Tizim", light: "Yorug‘", dark: "Qorong‘i" },
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
  const { locale } = useLocale();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const copy = themeCopy[locale];
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
