import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type CreateAxiosDefaults,
} from "axios";

const API_TIMEOUT_MS = 10_000;
const HEALTH_TIMEOUT_MS = 3_000;

export type ApiClientOptions = {
  locale?: string;
  accessToken?: string;
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

function resolveBrowserReachableBaseUrl(value: string) {
  const normalizedValue = normalizeBaseUrl(value);

  if (typeof window === "undefined") {
    return normalizedValue;
  }

  try {
    const apiUrl = new URL(normalizedValue);
    const currentUrl = new URL(window.location.href);
    const isApiLoopback =
      apiUrl.hostname === "localhost" || apiUrl.hostname === "127.0.0.1";
    const isCurrentLoopback =
      currentUrl.hostname === "localhost" ||
      currentUrl.hostname === "127.0.0.1";

    if (isApiLoopback && !isCurrentLoopback) {
      apiUrl.hostname = currentUrl.hostname;
    }

    return normalizeBaseUrl(apiUrl.toString());
  } catch {
    return normalizedValue;
  }
}

export function getApiBaseUrl() {
  const resolvedValue = resolveEnvValue(
    process.env.NEXT_PUBLIC_API_URL,
    process.env.API_URL,
  );

  return resolveBrowserReachableBaseUrl(resolvedValue);
}

export function createApiClient(
  options: ApiClientOptions = {},
): AxiosInstance {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...options.headers,
  };

  if (options.locale) {
    headers["Accept-Language"] = options.locale;
  }

  if (options.accessToken) {
    headers["Authorization"] = `Bearer ${options.accessToken}`;
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

export async function checkApiHealth(locale?: string) {
  try {
    const client = createApiClient({ locale });

    await client.request({
      url: "/health",
      method: "GET",
      timeout: HEALTH_TIMEOUT_MS,
    });

    return true;
  } catch {
    return false;
  }
}
