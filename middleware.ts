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

export function middleware(request: NextRequest) {
  const adminRoute = getAdminRoute();
  const adminPrefix = `/${adminRoute}`;
  const { pathname, search } = request.nextUrl;

  if (!pathname.startsWith(adminPrefix)) {
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
