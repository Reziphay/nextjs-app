import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isLocale, localeCookieName } from "./i18n/config";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const candidateLocale = pathname.replaceAll("/", "");

  if (!isLocale(candidateLocale)) {
    return NextResponse.next();
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/";

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set(localeCookieName, candidateLocale, {
    path: "/",
    maxAge: ONE_YEAR_IN_SECONDS,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: ["/az", "/en", "/ru", "/az/", "/en/", "/ru/"],
};
