import { isAxiosError } from "axios";
import { createApiClient } from "./api";
import { getStoredAccessToken } from "./auth-cookies";
import { performTokenRefresh } from "./token-refresh";

/**
 * Creates an Axios instance pre-loaded with the current access token.
 * On a 401 response it automatically:
 *   1. Calls performTokenRefresh() (de-duplicated singleton)
 *   2. Retries the original request with the new access token
 *   3. If refresh fails, rejects with the original error (store is
 *      already signed-out by performTokenRefresh)
 */
export function createAuthClient() {
  const accessToken = getStoredAccessToken();
  const client = createApiClient({ accessToken: accessToken ?? undefined });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (!isAxiosError(error)) {
        return Promise.reject(error);
      }

      const originalRequest = error.config;

      // Only intercept 401s; avoid infinite retry loops
      if (
        error.response?.status !== 401 ||
        !originalRequest ||
        (originalRequest as typeof originalRequest & { _retry?: boolean })._retry
      ) {
        return Promise.reject(error);
      }

      (originalRequest as typeof originalRequest & { _retry?: boolean })._retry = true;

      const newAccessToken = await performTokenRefresh();

      if (!newAccessToken) {
        return Promise.reject(error);
      }

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

      return client(originalRequest);
    },
  );

  return client;
}
