import { isAxiosError } from "axios";
import {
  normalizeBackendErrorMessage,
  translateBackendErrorMessage,
  type BackendErrorTranslations,
} from "@/lib/backend-errors";

type ApiErrorResponse = {
  message?: string | string[];
};

export function getApiErrorStatus(error: unknown) {
  return isAxiosError(error) ? error.response?.status ?? null : null;
}

export function getApiErrorMessage(
  error: unknown,
  translations: BackendErrorTranslations,
  fallback: string,
) {
  if (isAxiosError<ApiErrorResponse>(error)) {
    const normalized = normalizeBackendErrorMessage(error.response?.data?.message);

    return (
      translateBackendErrorMessage(normalized, translations) ??
      normalized ??
      fallback
    );
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
