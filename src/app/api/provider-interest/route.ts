import { NextResponse } from "next/server";

import { providerInterestSchema } from "@/features/forms/schemas";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = providerInterestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_PROVIDER_INTEREST",
          message:
            parsed.error.issues[0]?.message ?? "Invalid provider-interest submission.",
          details: parsed.error.flatten(),
        },
      },
      { status: 400 },
    );
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[website.provider-interest]", parsed.data);
  }

  return NextResponse.json({
    success: true,
    data: {
      receivedAt: new Date().toISOString(),
    },
    meta: {
      source: "website.provider-interest",
    },
  });
}

