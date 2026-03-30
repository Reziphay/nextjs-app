'use client';

import { E } from './endpoints';
import { normalizeAuthTokens } from '../models/auth';

// ─── Token Storage ────────────────────────────────────────────────────────────

const ACCESS_KEY = 'rzp_access';
const REFRESH_KEY = 'rzp_refresh';

export const tokenStore = {
  getAccess: (): string | null =>
    typeof window !== 'undefined' ? localStorage.getItem(ACCESS_KEY) : null,
  getRefresh: (): string | null =>
    typeof window !== 'undefined' ? localStorage.getItem(REFRESH_KEY) : null,
  save: (access: string, refresh: string) => {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
  hasTokens: (): boolean =>
    typeof window !== 'undefined' &&
    Boolean(localStorage.getItem(ACCESS_KEY) && localStorage.getItem(REFRESH_KEY)),
};

// ─── Types ────────────────────────────────────────────────────────────────────

type ApiEnvelope<T> = { data: T };

type ApiErrorPayload = {
  message?: string | string[];
  error?: string;
};

function unwrap<T>(payload: unknown): T {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'data' in payload
  ) {
    return (payload as ApiEnvelope<T>).data;
  }
  return payload as T;
}

export class AppApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'AppApiError';
    this.status = status;
  }
  get isUnauthorized() { return this.status === 401; }
  get isNotFound() { return this.status === 404; }
  get isServerError() { return this.status >= 500; }
}

function getErrorMessage(payload: unknown, status: number): string {
  if (typeof payload === 'object' && payload !== null) {
    const { error, message } = payload as ApiErrorPayload;

    if (Array.isArray(message) && message.length > 0) {
      return message.join(', ');
    }

    if (typeof message === 'string' && message.trim()) {
      return message;
    }

    if (typeof error === 'string' && error.trim()) {
      return error;
    }
  }

  return `Request failed: ${status}`;
}

// ─── Core fetch with 401-refresh-retry ───────────────────────────────────────

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

async function tryRefresh(): Promise<string | null> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return null;

  const res = await fetch(E.refresh, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    tokenStore.clear();
    return null;
  }

  const json = (await res.json()) as unknown;
  const data = unwrap<unknown>(json);
  const tokens = normalizeAuthTokens(data);

  if (!tokens) {
    tokenStore.clear();
    return null;
  }

  tokenStore.save(tokens.accessToken, tokens.refreshToken);
  return tokens.accessToken;
}

async function rawFetch(
  url: string,
  init: RequestInit = {},
  accessToken?: string | null,
): Promise<Response> {
  const token = accessToken ?? tokenStore.getAccess();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(init.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(url, { ...init, headers });
}

export async function appFetch<T>(
  url: string,
  init: RequestInit = {},
): Promise<T> {
  let res = await rawFetch(url, init);

  if (res.status === 401 || res.status === 403) {
    // Deduplicate concurrent refresh calls
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await tryRefresh();
      isRefreshing = false;
      refreshQueue.forEach((cb) => cb(newToken ?? ''));
      refreshQueue = [];

      if (!newToken) {
        // Session dead — redirect to onboarding
        if (typeof window !== 'undefined') {
          window.location.href = '/onboarding';
        }
        throw new AppApiError('Session expired', 401);
      }

      res = await rawFetch(url, init, newToken);
    } else {
      // Wait for existing refresh
      await new Promise<void>((resolve) => {
        refreshQueue.push(() => resolve());
      });
      res = await rawFetch(url, init);
    }
  }

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;

    try {
      const payload = (await res.json()) as unknown;
      message = getErrorMessage(payload, res.status);
    } catch {
      // ignore non-JSON error bodies
    }

    throw new AppApiError(message, res.status);
  }

  if (res.status === 204) return null as T;

  const json = (await res.json()) as unknown;
  return unwrap<T>(json);
}

// ─── Convenience helpers ──────────────────────────────────────────────────────

export const api = {
  get: <T>(url: string) => appFetch<T>(url, { method: 'GET' }),
  post: <T>(url: string, body?: unknown) =>
    appFetch<T>(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(url: string, body?: unknown) =>
    appFetch<T>(url, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(url: string, body?: unknown) =>
    appFetch<T>(url, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(url: string) => appFetch<T>(url, { method: 'DELETE' }),
  upload: <T>(url: string, form: FormData, method: 'POST' | 'PATCH' | 'PUT' = 'POST') =>
    appFetch<T>(url, { method, body: form }),
};
