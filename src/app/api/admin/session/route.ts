import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/auth/admin-auth";
import { serverEnv } from "@/lib/config/env";
import { adminLoginSchema } from "@/lib/validation/admin-auth";

export async function POST(request: Request) {
  const body = await request.json();
  const result = adminLoginSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Email and password are required.",
      },
      {
        status: 400,
      },
    );
  }

  if (
    result.data.email !== serverEnv.ADMIN_LOGIN_EMAIL ||
    result.data.password !== serverEnv.ADMIN_LOGIN_PASSWORD
  ) {
    return NextResponse.json(
      {
        error: "Credentials do not match the configured admin account.",
      },
      {
        status: 401,
      },
    );
  }

  const response = NextResponse.json({
    success: true,
  });

  response.cookies.set(ADMIN_SESSION_COOKIE, "authenticated", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
