import { NextResponse } from "next/server";

import { logoutAdmin } from "@/lib/api/admin-auth";
import { ADMIN_SESSION_COOKIE, readAdminSession } from "@/lib/auth/admin-auth";

export async function POST() {
  const session = await readAdminSession();
  await logoutAdmin(session);

  const response = NextResponse.json({
    success: true,
  });

  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });

  return response;
}
