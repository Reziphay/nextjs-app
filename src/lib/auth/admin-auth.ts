import { cookies } from "next/headers";

import { serverEnv } from "@/lib/config/env";

export const ADMIN_SESSION_COOKIE = "reziphay_admin_session";

export type AdminSession = {
  mode: "mock" | "remote";
  email: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  issuedAt: string;
};

export function getAdminRoute() {
  return serverEnv.ADMIN_ROUTE_SEGMENT;
}

export function buildAdminPath(path = "/", adminRoute = getAdminRoute()) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (normalizedPath === "/") {
    return `/${adminRoute}`;
  }

  return `/${adminRoute}${normalizedPath}`;
}

export function serializeAdminSession(session: AdminSession) {
  return encodeURIComponent(JSON.stringify(session));
}

export function parseAdminSession(
  value: string | undefined,
): AdminSession | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as Partial<AdminSession>;

    if (
      (parsed.mode === "mock" || parsed.mode === "remote") &&
      typeof parsed.email === "string" &&
      typeof parsed.issuedAt === "string"
    ) {
      return {
        mode: parsed.mode,
        email: parsed.email,
        issuedAt: parsed.issuedAt,
        accessToken: parsed.accessToken,
        refreshToken: parsed.refreshToken,
        expiresAt: parsed.expiresAt,
      };
    }
  } catch {}

  return null;
}

export function isValidAdminSession(session: AdminSession | null | undefined) {
  if (!session?.email || !session.issuedAt) {
    return false;
  }

  if (!session.expiresAt) {
    return true;
  }

  return new Date(session.expiresAt).getTime() > Date.now();
}

export function sanitizeNextPath(
  nextPath: string | null | undefined,
  fallback = buildAdminPath(),
) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return fallback;
  }

  return nextPath;
}

export function buildAdminLoginRedirect(
  nextPath: string,
  adminRoute = getAdminRoute(),
) {
  const loginPath = buildAdminPath("/login", adminRoute);
  const safeNextPath = sanitizeNextPath(nextPath, buildAdminPath("/", adminRoute));

  return `${loginPath}?next=${encodeURIComponent(safeNextPath)}`;
}

export type AdminGuardResult =
  | { allowed: true }
  | {
      allowed: false;
      reason: "not-found" | "unauthenticated";
      redirectTo?: string;
    };

export function resolveAdminGuard(options: {
  adminRoute: string;
  isAuthenticated: boolean;
  pathname: string;
}) {
  if (options.adminRoute !== getAdminRoute()) {
    return {
      allowed: false,
      reason: "not-found",
    } satisfies AdminGuardResult;
  }

  if (!options.isAuthenticated) {
    return {
      allowed: false,
      reason: "unauthenticated",
      redirectTo: buildAdminLoginRedirect(options.pathname, options.adminRoute),
    } satisfies AdminGuardResult;
  }

  return {
    allowed: true,
  } satisfies AdminGuardResult;
}

export async function readAdminSession() {
  const cookieStore = await cookies();
  const serializedSession = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const session = parseAdminSession(serializedSession);

  return isValidAdminSession(session) ? session : null;
}
