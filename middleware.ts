import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  buildAdminLoginRedirect,
  buildAdminPath,
  getAdminRoute,
  parseAdminSession,
  isValidAdminSession,
  sanitizeNextPath,
} from "@/lib/auth/admin-auth";

// App routes that require an authenticated consumer session.
// Token presence is checked client-side (localStorage), but we protect
// server-side rendering of these routes to avoid flash-of-unauthenticated content.
// The actual token validation + redirect is handled in AppBootstrap (providers.tsx).
const APP_PROTECTED_PREFIXES = ["/ucr", "/uso", "/settings"];

export function middleware(request: NextRequest) {
  const adminRoute = getAdminRoute();
  const adminPrefix = `/${adminRoute}`;
  const { pathname, search } = request.nextUrl;

  // ── Admin route guard ────────────────────────────────────────────────────
  if (!pathname.startsWith(adminPrefix)) {
    // Not an admin route — continue (app route guard is client-side)
    return NextResponse.next();
  }

  const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const isAuthenticated = isValidAdminSession(parseAdminSession(session));
  const loginPath = buildAdminPath("/login", adminRoute);

  if (pathname === loginPath) {
    if (!isAuthenticated) {
      return NextResponse.next();
    }

    const nextPath = sanitizeNextPath(
      request.nextUrl.searchParams.get("next"),
      buildAdminPath("/", adminRoute),
    );

    return NextResponse.redirect(new URL(nextPath, request.url));
  }

  if (isAuthenticated) {
    return NextResponse.next();
  }

  const redirectTarget = buildAdminLoginRedirect(
    `${pathname}${search}`,
    adminRoute,
  );

  return NextResponse.redirect(new URL(redirectTarget, request.url));
}

export const config = {
  matcher: ["/:path*"],
};
