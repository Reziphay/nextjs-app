import { NextResponse } from "next/server";

import { analyticsEventSchema } from "@/features/forms/schemas";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = analyticsEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_ANALYTICS_EVENT",
          message: "Analytics payload is invalid.",
          details: parsed.error.flatten(),
        },
      },
      { status: 400 },
    );
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[website.analytics]", parsed.data);
  }

  return NextResponse.json({
    success: true,
    data: {
      receivedAt: new Date().toISOString(),
    },
    meta: {
      source: "website.track",
    },
  });
}

