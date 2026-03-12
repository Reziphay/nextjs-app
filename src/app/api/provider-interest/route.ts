import { NextResponse } from "next/server";

import { HONEYPOT_FIELD_NAME } from "@/features/forms/constants";
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

  if (parsed.data[HONEYPOT_FIELD_NAME]?.trim()) {
    return NextResponse.json({
      success: true,
      data: {
        receivedAt: new Date().toISOString(),
      },
      meta: {
        source: "website.provider-interest",
        filtered: "honeypot",
      },
    });
  }

  if (process.env.NODE_ENV !== "production") {
    const submission = { ...parsed.data };
    delete submission[HONEYPOT_FIELD_NAME];
    console.info("[website.provider-interest]", submission);
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
