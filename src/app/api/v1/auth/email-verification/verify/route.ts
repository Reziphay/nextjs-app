import { NextResponse, type NextRequest } from "next/server";

export function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim();
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/auth/verify-email";
  redirectUrl.search = token ? `?token=${encodeURIComponent(token)}` : "";

  return NextResponse.redirect(redirectUrl);
}
