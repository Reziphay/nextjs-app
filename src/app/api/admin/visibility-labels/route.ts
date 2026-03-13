import { NextResponse } from "next/server";

import { createVisibilityAssignment } from "@/lib/api/admin-mutations";
import { readAdminSession } from "@/lib/auth/admin-auth";
import { visibilityLabelSchema } from "@/lib/validation/visibility";

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
  const result = visibilityLabelSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Invalid visibility label payload.",
      },
      {
        status: 400,
      },
    );
  }

  const actionResult = await createVisibilityAssignment(result.data, session);

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
