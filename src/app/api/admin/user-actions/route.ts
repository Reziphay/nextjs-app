import { NextResponse } from "next/server";

import { submitUserAction } from "@/lib/api/admin-mutations";
import { readAdminSession } from "@/lib/auth/admin-auth";
import { userActionRequestSchema } from "@/lib/validation/admin-actions";

export async function POST(request: Request) {
  const session = await readAdminSession();

  if (!session) {
    return NextResponse.json(
      {
        error: "Admin authentication is required.",
      },
      {
        status: 401,
      },
    );
  }

  const body = await request.json();
  const result = userActionRequestSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Invalid user action payload.",
      },
      {
        status: 400,
      },
    );
  }

  const actionResult = await submitUserAction(result.data, session);

  if (!actionResult.ok) {
    return NextResponse.json(
      {
        error: actionResult.error,
      },
      {
        status: actionResult.status,
      },
    );
  }

  return NextResponse.json({
    success: true,
    message: actionResult.message,
  });
}
