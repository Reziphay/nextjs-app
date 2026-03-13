import { NextResponse } from "next/server";

import { loginAdmin } from "@/lib/api/admin-auth";
import {
  ADMIN_SESSION_COOKIE,
  serializeAdminSession,
} from "@/lib/auth/admin-auth";
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

  const loginResult = await loginAdmin(result.data);

  if (!loginResult.ok) {
    return NextResponse.json(
      {
        error: loginResult.error,
      },
      {
        status: loginResult.status,
      },
    );
  }

  const response = NextResponse.json({
    success: true,
  });

  response.cookies.set(
    ADMIN_SESSION_COOKIE,
    serializeAdminSession(loginResult.session),
    {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    },
  );

  return response;
}
