import { getApiBaseUrl } from "@/lib/api";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return Response.json({ message }, { status });
}

function getAllowedApiOrigin() {
  const apiBaseUrl = getApiBaseUrl();

  if (!apiBaseUrl) {
    return null;
  }

  try {
    return new URL(apiBaseUrl).origin;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const mediaUrl = request.nextUrl.searchParams.get("url");

  if (!mediaUrl) {
    return jsonError("Missing media url.", 400);
  }

  const allowedApiOrigin = getAllowedApiOrigin();

  if (!allowedApiOrigin) {
    return jsonError("API base URL is not configured.", 500);
  }

  let parsedMediaUrl: URL;

  try {
    parsedMediaUrl = new URL(mediaUrl);
  } catch {
    return jsonError("Invalid media url.", 400);
  }

  const isAllowedUploadUrl =
    parsedMediaUrl.origin === allowedApiOrigin &&
    parsedMediaUrl.pathname.startsWith("/uploads/");

  if (!isAllowedUploadUrl) {
    return jsonError("Forbidden media url.", 403);
  }

  const upstreamResponse = await fetch(parsedMediaUrl.toString(), {
    cache: "no-store",
    headers: {
      Accept: "image/*",
    },
  });

  if (!upstreamResponse.ok) {
    return new Response(null, { status: upstreamResponse.status });
  }

  const contentType = upstreamResponse.headers.get("content-type") ?? "";

  if (!contentType.startsWith("image/")) {
    return jsonError("Unsupported media type.", 415);
  }

  const buffer = await upstreamResponse.arrayBuffer();

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control":
        upstreamResponse.headers.get("cache-control") ?? "private, max-age=60",
      "Content-Length": buffer.byteLength.toString(),
    },
  });
}
