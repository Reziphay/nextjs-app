import type { Messages } from "@/i18n/types";

export type BackendErrorTranslations = Messages["backendErrors"];

export function normalizeBackendErrorMessage(
  message: string | string[] | undefined,
) {
  if (Array.isArray(message)) {
    const normalized = message
      .map((part) => part.trim())
      .filter(Boolean)
      .join(" ");

    return normalized || undefined;
  }

  const normalized = message?.trim();

  return normalized || undefined;
}

export function translateBackendErrorMessage(
  message: string | string[] | undefined,
  translations: BackendErrorTranslations,
) {
  const normalized = normalizeBackendErrorMessage(message);

  if (!normalized) {
    return undefined;
  }

  if (translations[normalized]) {
    return translations[normalized];
  }

  return normalized.includes(".") ? undefined : normalized;
}
