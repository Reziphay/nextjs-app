import { azMessages } from "./locales/az";
import { enMessages } from "./locales/en";
import { ruMessages } from "./locales/ru";
import type { Messages } from "./types";

export const locales = ["az", "en", "ru"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "az";
export const localeStorageKey = "reziphay-locale";
export const localeCookieName = "reziphay-locale";

export const localeLabels: Record<Locale, string> = {
  az: "AZ",
  en: "EN",
  ru: "RU",
};

export const localeNames: Record<Locale, string> = {
  az: "Azərbaycan",
  en: "English",
  ru: "Русский",
};

const messages: Record<Locale, Messages> = {
  az: azMessages,
  en: enMessages,
  ru: ruMessages,
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function resolveLocale(value?: string | null): Locale {
  return value && isLocale(value) ? value : defaultLocale;
}

export function getMessages(locale: Locale) {
  return messages[locale];
}

export type { Messages } from "./types";
