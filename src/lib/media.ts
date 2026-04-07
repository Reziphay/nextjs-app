/**
 * Wraps an API media URL in the local proxy so Next.js Image can fetch it
 * without hitting the "private IP" restriction.
 *
 * Any URL whose origin matches the API base URL (or that looks like a
 * localhost upload URL) is routed through /api/media/avatar which already
 * handles the proxying, CORS, and caching headers.
 */
export function proxyMediaUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;

  try {
    const parsed = new URL(url);
    const isUpload = parsed.pathname.startsWith("/uploads/");

    if (!isUpload) return url;

    return `/api/media/avatar?url=${encodeURIComponent(url)}`;
  } catch {
    return url;
  }
}
