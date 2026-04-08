import { createApiClient } from "@/lib/api";
import type { ApiSuccessResponse, PublicUserProfile } from "@/types";

export async function fetchUserProfileById(
  userId: string,
  accessToken: string,
): Promise<PublicUserProfile | null> {
  try {
    const client = createApiClient({ accessToken });
    const response = await client.request<ApiSuccessResponse<{ user: PublicUserProfile }>>({
      url: `/users/${encodeURIComponent(userId)}`,
      method: "GET",
    });

    return response.data?.data?.user ?? null;
  } catch {
    return null;
  }
}
