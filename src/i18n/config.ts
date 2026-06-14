import { azMessages } from "./locales/az";
import { enMessages } from "./locales/en";
import { ruMessages } from "./locales/ru";
import { trMessages } from "./locales/tr";
import type { Messages } from "./types";

export const locales = ["az", "en", "ru", "tr"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "az";
export const localeStorageKey = "reziphay-locale";
export const localeCookieName = "reziphay-locale";

export const localeLabels: Record<Locale, string> = {
  az: "AZ",
  en: "EN",
  ru: "RU",
  tr: "TR",
};

const localeMetadata: Record<
  Locale,
  { language: string; region?: string; fallbackName: string }
> = {
  az: { language: "az", fallbackName: "Azərbaycan" },
  en: { language: "en", fallbackName: "English" },
  ru: { language: "ru", fallbackName: "Русский" },
  tr: { language: "tr", fallbackName: "Türkçe" },
};

const messages: Record<Locale, Messages> = {
  az: azMessages,
  en: enMessages,
  ru: ruMessages,
  tr: trMessages,
};

const legacyLocaleAliases: Record<string, Locale> = {
  "en-IN": "en",
  "en-GB": "en",
  "en-US": "en",
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function resolveLocale(value?: string | null): Locale {
  if (!value) {
    return defaultLocale;
  }

  if (isLocale(value)) {
    return value;
  }

  return legacyLocaleAliases[value] ?? defaultLocale;
}

export function getMessages(locale: Locale) {
  return messages[locale];
}

export function getLocaleDirection(locale: Locale) {
  void locale;
  return "ltr";
}

export function getLocaleName(
  entry: Locale,
  displayLocale: Locale,
) {
  const metadata = localeMetadata[entry];
  const languageDisplayNames = new Intl.DisplayNames([displayLocale], {
    type: "language",
  });

  const languageName =
    languageDisplayNames.of(metadata.language) ?? metadata.fallbackName;

  if (!metadata.region) {
    return languageName;
  }

  const regionDisplayNames = new Intl.DisplayNames([displayLocale], {
    type: "region",
  });

  const regionName =
    regionDisplayNames.of(metadata.region) ?? metadata.region;

  return `${languageName} (${regionName})`;
}

export function getLocaleNames(displayLocale: Locale) {
  return Object.fromEntries(
    locales.map((entry) => [entry, getLocaleName(entry, displayLocale)]),
  ) as Record<Locale, string>;
}

export type { Messages } from "./types";
