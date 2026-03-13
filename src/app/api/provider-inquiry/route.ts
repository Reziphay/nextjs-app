import { NextResponse } from "next/server";

import { providerInquirySchema } from "@/lib/validation/provider-inquiry";

export async function POST(request: Request) {
  const body = await request.json();
  const result = providerInquirySchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Invalid provider inquiry payload.",
      },
      {
        status: 400,
      },
    );
  }

  return NextResponse.json({
    success: true,
  });
}
