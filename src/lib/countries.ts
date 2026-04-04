import type { Locale } from "@/i18n/config";

type CountryDirectoryItem = {
  labels: Record<Locale, string>;
  prefix: string;
  value: string;
};

export const countryDirectory = [
  {
    value: "Azerbaijan",
    prefix: "+994",
    labels: {
      az: "Azərbaycan",
      en: "Azerbaijan",
      ru: "Азербайджан",
    },
  },
  {
    value: "Russia",
    prefix: "+7",
    labels: {
      az: "Rusiya",
      en: "Russia",
      ru: "Россия",
    },
  },
  {
    value: "Turkey",
    prefix: "+90",
    labels: {
      az: "Türkiyə",
      en: "Turkey",
      ru: "Турция",
    },
  },
  {
    value: "United States",
    prefix: "+1",
    labels: {
      az: "Amerika",
      en: "United States",
      ru: "США",
    },
  },
  {
    value: "Canada",
    prefix: "+1",
    labels: {
      az: "Kanada",
      en: "Canada",
      ru: "Канада",
    },
  },
  {
    value: "United Kingdom",
    prefix: "+44",
    labels: {
      az: "Birləşmiş Krallıq",
      en: "United Kingdom",
      ru: "Великобритания",
    },
  },
  {
    value: "Germany",
    prefix: "+49",
    labels: {
      az: "Almaniya",
      en: "Germany",
      ru: "Германия",
    },
  },
  {
    value: "France",
    prefix: "+33",
    labels: {
      az: "Fransa",
      en: "France",
      ru: "Франция",
    },
  },
  {
    value: "Italy",
    prefix: "+39",
    labels: {
      az: "İtaliya",
      en: "Italy",
      ru: "Италия",
    },
  },
  {
    value: "Spain",
    prefix: "+34",
    labels: {
      az: "İspaniya",
      en: "Spain",
      ru: "Испания",
    },
  },
  {
    value: "Netherlands",
    prefix: "+31",
    labels: {
      az: "Niderland",
      en: "Netherlands",
      ru: "Нидерланды",
    },
  },
  {
    value: "Sweden",
    prefix: "+46",
    labels: {
      az: "İsveç",
      en: "Sweden",
      ru: "Швеция",
    },
  },
  {
    value: "Norway",
    prefix: "+47",
    labels: {
      az: "Norveç",
      en: "Norway",
      ru: "Норвегия",
    },
  },
  {
    value: "Poland",
    prefix: "+48",
    labels: {
      az: "Polşa",
      en: "Poland",
      ru: "Польша",
    },
  },
  {
    value: "Ukraine",
    prefix: "+380",
    labels: {
      az: "Ukrayna",
      en: "Ukraine",
      ru: "Украина",
    },
  },
  {
    value: "Georgia",
    prefix: "+995",
    labels: {
      az: "Gürcüstan",
      en: "Georgia",
      ru: "Грузия",
    },
  },
  {
    value: "Kazakhstan",
    prefix: "+7",
    labels: {
      az: "Qazaxıstan",
      en: "Kazakhstan",
      ru: "Казахстан",
    },
  },
  {
    value: "Uzbekistan",
    prefix: "+998",
    labels: {
      az: "Özbəkistan",
      en: "Uzbekistan",
      ru: "Узбекистан",
    },
  },
  {
    value: "Saudi Arabia",
    prefix: "+966",
    labels: {
      az: "Səudiyyə Ərəbistanı",
      en: "Saudi Arabia",
      ru: "Саудовская Аравия",
    },
  },
  {
    value: "United Arab Emirates",
    prefix: "+971",
    labels: {
      az: "Birləşmiş Ərəb Əmirlikləri",
      en: "United Arab Emirates",
      ru: "ОАЭ",
    },
  },
  {
    value: "Qatar",
    prefix: "+974",
    labels: {
      az: "Qatar",
      en: "Qatar",
      ru: "Катар",
    },
  },
  {
    value: "Kuwait",
    prefix: "+965",
    labels: {
      az: "Küveyt",
      en: "Kuwait",
      ru: "Кувейт",
    },
  },
  {
    value: "China",
    prefix: "+86",
    labels: {
      az: "Çin",
      en: "China",
      ru: "Китай",
    },
  },
  {
    value: "Japan",
    prefix: "+81",
    labels: {
      az: "Yaponiya",
      en: "Japan",
      ru: "Япония",
    },
  },
  {
    value: "South Korea",
    prefix: "+82",
    labels: {
      az: "Cənubi Koreya",
      en: "South Korea",
      ru: "Южная Корея",
    },
  },
  {
    value: "India",
    prefix: "+91",
    labels: {
      az: "Hindistan",
      en: "India",
      ru: "Индия",
    },
  },
  {
    value: "Pakistan",
    prefix: "+92",
    labels: {
      az: "Pakistan",
      en: "Pakistan",
      ru: "Пакистан",
    },
  },
  {
    value: "Brazil",
    prefix: "+55",
    labels: {
      az: "Braziliya",
      en: "Brazil",
      ru: "Бразилия",
    },
  },
  {
    value: "Australia",
    prefix: "+61",
    labels: {
      az: "Avstraliya",
      en: "Australia",
      ru: "Австралия",
    },
  },
  {
    value: "Mexico",
    prefix: "+52",
    labels: {
      az: "Meksika",
      en: "Mexico",
      ru: "Мексика",
    },
  },
] as const satisfies readonly CountryDirectoryItem[];

export type CountryDirectoryValue = (typeof countryDirectory)[number]["value"];

const collatorLocales: Record<Locale, string> = {
  az: "az-AZ",
  en: "en-US",
  ru: "ru-RU",
};

function normalizeLookupValue(value: string) {
  return value.trim().toLocaleLowerCase();
}

export function findCountryByValue(value: string) {
  const normalizedValue = normalizeLookupValue(value);

  if (!normalizedValue) {
    return undefined;
  }

  return countryDirectory.find((country) => {
    if (normalizeLookupValue(country.value) === normalizedValue) {
      return true;
    }

    return Object.values(country.labels).some(
      (label) => normalizeLookupValue(label) === normalizedValue,
    );
  });
}

export function normalizeCountryValue(value: string) {
  return findCountryByValue(value)?.value ?? value.trim();
}

export function getCountryLabel(value: string, locale: Locale) {
  return findCountryByValue(value)?.labels[locale] ?? value;
}

export function getCountryOptions(locale: Locale) {
  const collator = new Intl.Collator(collatorLocales[locale], {
    sensitivity: "base",
  });

  return countryDirectory
    .map((country) => ({
      value: country.value,
      label: country.labels[locale],
      keywords: [...Object.values(country.labels), country.prefix],
    }))
    .sort((left, right) => collator.compare(left.label, right.label));
}
