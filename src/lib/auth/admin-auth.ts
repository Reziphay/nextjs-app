import { cookies } from "next/headers";

import { serverEnv } from "@/lib/config/env";

export const ADMIN_SESSION_COOKIE = "reziphay_admin_session";

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

export function isValidAdminSession(session: string | undefined) {
  return session === "authenticated";
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
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  return isValidAdminSession(session);
}
