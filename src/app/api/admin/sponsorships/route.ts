import { NextResponse } from "next/server";

import { createSponsorshipCampaign } from "@/lib/api/admin-mutations";
import { readAdminSession } from "@/lib/auth/admin-auth";
import { sponsorshipSchema } from "@/lib/validation/sponsorship";

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
  const result = sponsorshipSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Invalid sponsorship payload.",
      },
      {
        status: 400,
      },
    );
  }

  const actionResult = await createSponsorshipCampaign(result.data, session);

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
