import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type CreateAxiosDefaults,
} from "axios";

const API_TIMEOUT_MS = 10_000;

export type ApiClientOptions = {
  locale?: string;
  headers?: Record<string, string>;
};

function resolveEnvValue(value?: string | null, fallback?: string | null) {
  const normalizedValue = value?.trim();

  if (normalizedValue && !normalizedValue.startsWith("$")) {
    return normalizedValue;
  }

  return fallback?.trim() ?? "";
}

function normalizeBaseUrl(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getApiBaseUrl() {
  const resolvedValue = resolveEnvValue(
    process.env.NEXT_PUBLIC_API_URL,
    process.env.API_URL,
  );

  return normalizeBaseUrl(resolvedValue);
}

export function createApiClient(
  options: ApiClientOptions = {},
): AxiosInstance {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (options.locale) {
    headers["Accept-Language"] = options.locale;
  }

  const config: CreateAxiosDefaults = {
    baseURL: getApiBaseUrl(),
    timeout: API_TIMEOUT_MS,
    headers,
  };

  return axios.create(config);
}

export const api = createApiClient();

export async function apiRequest<TResponse = unknown>(
  config: AxiosRequestConfig,
  client: AxiosInstance = api,
) {
  const response = await client.request<TResponse>(config);
  return response.data;
}
