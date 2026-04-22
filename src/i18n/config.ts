import { azMessages } from "./locales/az";
import { arMessages } from "./locales/ar";
import { deMessages } from "./locales/de";
import { enMessages } from "./locales/en";
import { esMessages } from "./locales/es";
import { faMessages } from "./locales/fa";
import { frMessages } from "./locales/fr";
import { heMessages } from "./locales/he";
import { hiMessages } from "./locales/hi";
import { itMessages } from "./locales/it";
import { jaMessages } from "./locales/ja";
import { laMessages } from "./locales/la";
import { ptMessages } from "./locales/pt";
import { ruMessages } from "./locales/ru";
import { trMessages } from "./locales/tr";
import { ukMessages } from "./locales/uk";
import { uzMessages } from "./locales/uz";
import { zhMessages } from "./locales/zh";
import type { Messages } from "./types";

export const locales = [
  "az",
  "en",
  "ru",
  "es",
  "fr",
  "tr",
  "ar",
  "de",
  "zh",
  "ja",
  "hi",
  "la",
  "fa",
  "it",
  "uk",
  "pt",
  "he",
  "uz",
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "az";
export const localeStorageKey = "reziphay-locale";
export const localeCookieName = "reziphay-locale";

export const localeLabels: Record<Locale, string> = {
  az: "AZ",
  en: "EN",
  ru: "RU",
  es: "ES",
  fr: "FR",
  tr: "TR",
  ar: "AR",
  de: "DE",
  zh: "ZH",
  ja: "JA",
  hi: "HI",
  la: "LA",
  fa: "FA",
  it: "IT",
  uk: "UA",
  pt: "PT",
  he: "HE",
  uz: "UZ",
};

const localeMetadata: Record<
  Locale,
  { language: string; region?: string; fallbackName: string }
> = {
  az: { language: "az", fallbackName: "Azərbaycan" },
  en: { language: "en", fallbackName: "English" },
  ru: { language: "ru", fallbackName: "Русский" },
  es: { language: "es", fallbackName: "Español" },
  fr: { language: "fr", fallbackName: "Français" },
  tr: { language: "tr", fallbackName: "Türkçe" },
  ar: { language: "ar", fallbackName: "العربية" },
  de: { language: "de", fallbackName: "Deutsch" },
  zh: { language: "zh", fallbackName: "中文" },
  ja: { language: "ja", fallbackName: "日本語" },
  hi: { language: "hi", fallbackName: "हिन्दी" },
  la: { language: "la", fallbackName: "Latina" },
  fa: { language: "fa", fallbackName: "فارسی" },
  it: { language: "it", fallbackName: "Italiano" },
  uk: { language: "uk", fallbackName: "Українська" },
  pt: { language: "pt", fallbackName: "Português" },
  he: { language: "he", fallbackName: "עברית" },
  uz: { language: "uz", fallbackName: "O‘zbek" },
};

const messages: Record<Locale, Messages> = {
  az: azMessages,
  ar: arMessages,
  de: deMessages,
  en: enMessages,
  es: esMessages,
  fa: faMessages,
  fr: frMessages,
  he: heMessages,
  hi: hiMessages,
  it: itMessages,
  ja: jaMessages,
  la: laMessages,
  pt: ptMessages,
  ru: ruMessages,
  tr: trMessages,
  uk: ukMessages,
  uz: uzMessages,
  zh: zhMessages,
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
  return locale === "ar" || locale === "fa" || locale === "he" ? "rtl" : "ltr";
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
