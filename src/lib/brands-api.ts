import { createApiClient } from "@/lib/api";
import type { Brand, BrandCategory, Branch, BrandSocialLinks } from "@/types/brand";
import type { ApiSuccessResponse } from "@/types";

export type SocialLinksPayload = {
  [K in keyof BrandSocialLinks]?: string | null;
};

export type CreateBrandPayload = {
  name: string;
  description?: string;
  categoryIds?: string[];
  logo_media_id?: string;
  gallery_media_ids?: string[];
  branches?: BranchPayload[];
} & SocialLinksPayload;

export type UpdateBrandPayload = {
  name?: string;
  description?: string | null;
  categoryIds?: string[];
  /** Set to null to remove the logo; omit to leave unchanged. */
  logo_media_id?: string | null;
  /** Full ordered list of media IDs (existing + new). Omit to leave gallery unchanged. */
  gallery_media_ids?: string[];
} & SocialLinksPayload;

export type BranchPayload = {
  name: string;
  description?: string;
  cover_media_id?: string;
  address1: string;
  address2?: string;
  phone?: string;
  email?: string;
  is_24_7: boolean;
  opening?: string;
  closing?: string;
  breaks?: { start: string; end: string }[];
};

export type UpdateBranchPayload = {
  name?: string;
  description?: string | null;
  cover_media_id?: string | null;
  address1?: string;
  address2?: string | null;
  phone?: string | null;
  email?: string | null;
  is_24_7?: boolean;
  opening?: string | null;
  closing?: string | null;
  breaks?: { start: string; end: string }[];
};

// Only delete_with_services is accepted by the backend until the Service domain
// is built. Transfer-service paths are intentionally absent.
export type DeleteBrandPayload = {
  service_handling: "delete_with_services";
};

export type BrandMediaUsage = "logo" | "gallery" | "branch_cover";

export type UserSearchResult = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string | null;
};

export type BrandTransfer = {
  id: string;
  brand_id: string;
  from_user_id: string;
  to_user_id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  created_at: string;
  updated_at: string;
};

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
  read: boolean;
  created_at: string;
};

export type NotificationFeedSourceType =
  | "notification"
  | "team_invitation"
  | "incoming_transfer"
  | "outgoing_transfer";

export type NotificationFeedNotificationData = Record<string, unknown> & {
  notification_type?: string;
  read?: boolean;
};

export type NotificationFeedPerson = {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
};

export type NotificationFeedTeamInvitationData = {
  team_member_id: string;
  team_id: string;
  branch_id: string;
  branch_name: string;
  brand_id: string;
  brand_name: string;
  role: TeamMemberRole;
  invited_by?: NotificationFeedPerson | null;
};

export type NotificationFeedIncomingTransferData = {
  transfer_id: string;
  brand_id: string;
  brand_name: string;
  from_user?: NotificationFeedPerson | null;
};

export type NotificationFeedOutgoingTransferData = {
  transfer_id: string;
  brand_id: string;
  brand_name: string;
  to_user?: NotificationFeedPerson | null;
};

export type NotificationFeedItem =
  | {
      feed_id: string;
      type: "notification";
      source_id: string;
      title: string;
      body: string;
      created_at: string;
      data: NotificationFeedNotificationData;
    }
  | {
      feed_id: string;
      type: "team_invitation";
      source_id: string;
      title: string;
      body: string;
      created_at: string;
      data: NotificationFeedTeamInvitationData;
    }
  | {
      feed_id: string;
      type: "incoming_transfer";
      source_id: string;
      title: string;
      body: string;
      created_at: string;
      data: NotificationFeedIncomingTransferData;
    }
  | {
      feed_id: string;
      type: "outgoing_transfer";
      source_id: string;
      title: string;
      body: string;
      created_at: string;
      data: NotificationFeedOutgoingTransferData;
    };

export type NotificationFeedMeta = {
  total_count: number;
  unread_count: number;
};

export type NotificationFeed = {
  items: NotificationFeedItem[];
  meta: NotificationFeedMeta;
};

export type BrandTransferParty = {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
};

export type BrandTransferBrandSummary = {
  id: string;
  name: string;
  logo_url?: string | null;
};

export type BrandTransferListItem = {
  id: string;
  brand_id: string;
  from_user_id: string;
  to_user_id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  created_at: string;
  updated_at: string;
  brand: BrandTransferBrandSummary;
  from_user: BrandTransferParty;
  to_user: BrandTransferParty;
};

export type TeamMemberRole = "OWNER" | "MEMBER";

export type TeamMemberStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "REMOVED";

export type TeamWorkspaceMember = {
  membership_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string | null;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  invited_by_user_id: string;
  invited_at: string;
  updated_at: string;
};

export type TeamWorkspaceBranch = {
  branch_id: string;
  branch_name: string;
  cover_media_id?: string | null;
  cover_url?: string | null;
  address: {
    address1: string;
    address2: string | null;
  };
  availability: {
    is_24_7: boolean;
    opening: string | null;
    closing: string | null;
  };
  team_id: string | null;
  team_created_at: string | null;
  members: {
    accepted: TeamWorkspaceMember[];
    pending: TeamWorkspaceMember[];
    rejected: TeamWorkspaceMember[];
    removed: TeamWorkspaceMember[];
  };
};

export type BranchTeamDetail = {
  team_id: string | null;
  branch_id: string;
  branch_name: string;
  cover_media_id?: string | null;
  cover_url?: string | null;
  address: {
    address1: string;
    address2: string | null;
  };
  availability: {
    is_24_7: boolean;
    opening: string | null;
    closing: string | null;
  };
  members: {
    accepted: TeamWorkspaceMember[];
    pending: TeamWorkspaceMember[];
    rejected: TeamWorkspaceMember[];
    removed: TeamWorkspaceMember[];
  };
};

export type BrandTeamWorkspace = {
  brand_id: string;
  brand_name: string;
  brand_status: Brand["status"];
  brand_logo_url?: string | null;
  branches: TeamWorkspaceBranch[];
};

export type TeamInvitation = {
  membership_id: string;
  status: TeamMemberStatus;
  role: TeamMemberRole;
  invited_at: string;
  team_id: string;
  branch: {
    id: string;
    name: string;
  };
  brand: {
    id: string;
    name: string;
    logo_url?: string | null;
  };
};

function normalizeBranch(branch: Branch): Branch {
  return {
    ...branch,
    description: branch.description ?? undefined,
    cover_media_id: branch.cover_media_id ?? null,
    cover_url: branch.cover_url ?? null,
    address2: branch.address2 ?? undefined,
    phone: branch.phone ?? undefined,
    email: branch.email ?? undefined,
    opening: branch.opening ?? undefined,
    closing: branch.closing ?? undefined,
    breaks: branch.breaks ?? [],
  };
}

function normalizeBrand(brand: Brand): Brand {
  return {
    ...brand,
    categories: brand.categories ?? [],
    gallery: brand.gallery ?? [],
    branches: (brand.branches ?? []).map(normalizeBranch),
    rating: brand.rating ?? null,
    rating_count: brand.rating_count ?? 0,
    my_rating: brand.my_rating ?? null,
  };
}

function normalizeBrands(brands: Brand[] | undefined): Brand[] {
  return (brands ?? []).map(normalizeBrand);
}

export async function fetchMyBrands(accessToken: string): Promise<Brand[]> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ brands: Brand[] }>>({
    url: "/brands/mine",
    method: "GET",
  });
  return normalizeBrands(response.data?.data?.brands);
}

export async function fetchBrandById(
  id: string,
  accessToken?: string,
): Promise<Brand | null> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ brand: Brand }>>({
    url: `/brands/${id}`,
    method: "GET",
  });
  const brand = response.data?.data?.brand;
  return brand ? normalizeBrand(brand) : null;
}

export async function fetchActiveBrands(accessToken?: string): Promise<Brand[]> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ brands: Brand[] }>>({
    url: "/brands",
    method: "GET",
    params: { status: "ACTIVE" },
  });
  return normalizeBrands(response.data?.data?.brands);
}

export async function fetchAccountBrands(
  accountUserId: string,
  accessToken?: string,
): Promise<Brand[]> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ brands: Brand[] }>>({
    url: "/brands",
    method: "GET",
    params: { account: accountUserId },
  });

  return normalizeBrands(response.data?.data?.brands).filter(
    (brand) =>
      brand.owner_id === accountUserId &&
      (brand.status === "ACTIVE" || brand.status === "CLOSED"),
  );
}

export async function fetchAllAccountBrands(
  accountUserId: string,
  accessToken?: string,
): Promise<Brand[]> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ brands: Brand[] }>>({
    url: "/brands",
    method: "GET",
    params: { account: accountUserId },
  });

  return normalizeBrands(response.data?.data?.brands).filter(
    (brand) => brand.owner_id === accountUserId,
  );
}

export async function fetchBrandCategories(
  accessToken?: string,
): Promise<BrandCategory[]> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ categories: BrandCategory[] }>>({
    url: "/brand-categories",
    method: "GET",
  });
  return response.data?.data?.categories ?? [];
}

export async function createBrand(
  payload: CreateBrandPayload,
  accessToken: string,
): Promise<Brand> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ brand: Brand }>>({
    url: "/brands",
    method: "POST",
    data: payload,
  });

  const brand = response.data?.data?.brand;
  if (!brand) throw new Error("Invalid response from create brand API");
  return normalizeBrand(brand);
}

export async function updateBrand(
  id: string,
  payload: UpdateBrandPayload,
  accessToken: string,
): Promise<Brand> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ brand: Brand }>>({
    url: `/brands/${id}`,
    method: "PATCH",
    data: payload,
  });

  const brand = response.data?.data?.brand;
  if (!brand) throw new Error("Invalid response from update brand API");
  return normalizeBrand(brand);
}

export async function deleteBrand(
  id: string,
  payload: DeleteBrandPayload,
  accessToken: string,
): Promise<void> {
  const client = createApiClient({ accessToken });
  await client.request({
    url: `/brands/${id}`,
    method: "DELETE",
    data: payload,
  });
}

// ─── Branches ─────────────────────────────────────────────────────────────────

export async function createBranch(
  brandId: string,
  branch: BranchPayload,
  accessToken: string,
): Promise<Branch> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ branch: Branch }>>({
    url: `/brands/${brandId}/branches`,
    method: "POST",
    data: branch,
  });
  const createdBranch = response.data?.data?.branch;
  if (!createdBranch) {
    throw new Error("Invalid response from create branch API");
  }
  return normalizeBranch(createdBranch);
}

export async function updateBranch(
  brandId: string,
  branchId: string,
  payload: UpdateBranchPayload,
  accessToken: string,
): Promise<Branch> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ branch: Branch }>>({
    url: `/brands/${brandId}/branches/${branchId}`,
    method: "PATCH",
    data: payload,
  });
  const updatedBranch = response.data?.data?.branch;
  if (!updatedBranch) {
    throw new Error("Invalid response from update branch API");
  }
  return normalizeBranch(updatedBranch);
}

export async function deleteBranchApi(
  brandId: string,
  branchId: string,
  accessToken: string,
): Promise<void> {
  const client = createApiClient({ accessToken });
  await client.request({
    url: `/brands/${brandId}/branches/${branchId}`,
    method: "DELETE",
  });
}

// ─── Media ────────────────────────────────────────────────────────────────────

export async function uploadBrandMedia(
  file: File,
  accessToken: string,
  usage?: BrandMediaUsage,
): Promise<{ media_id: string; url: string }> {
  const client = createApiClient({ accessToken });
  const formData = new FormData();
  formData.append("file", file);
  if (usage) {
    formData.append("usage", usage);
  }
  const response = await client.request<ApiSuccessResponse<{ media_id: string; url: string }>>({
    url: "/brands/media",
    method: "POST",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  });
  const data = response.data?.data;
  if (!data?.media_id) throw new Error("Invalid response from brand media upload API");
  return data;
}

// ─── Transfer ─────────────────────────────────────────────────────────────────

export async function initiateTransfer(
  brandId: string,
  targetUserId: string,
  accessToken: string,
): Promise<BrandTransfer> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ transfer: BrandTransfer }>>({
    url: `/brands/${brandId}/transfer`,
    method: "POST",
    data: { target_user_id: targetUserId },
  });
  const transfer = response.data?.data?.transfer;
  if (!transfer) throw new Error("Invalid response from transfer initiation API");
  return transfer;
}

export async function acceptTransfer(
  transferId: string,
  accessToken: string,
): Promise<void> {
  const client = createApiClient({ accessToken });
  await client.request({
    url: `/brands/transfers/${transferId}/accept`,
    method: "PATCH",
  });
}

export async function rejectTransfer(
  transferId: string,
  accessToken: string,
): Promise<void> {
  const client = createApiClient({ accessToken });
  await client.request({
    url: `/brands/transfers/${transferId}/reject`,
    method: "PATCH",
  });
}

export async function cancelTransfer(
  transferId: string,
  accessToken: string,
): Promise<void> {
  const client = createApiClient({ accessToken });
  await client.request({
    url: `/brands/transfers/${transferId}/cancel`,
    method: "PATCH",
  });
}

export async function fetchIncomingTransfers(
  accessToken: string,
): Promise<BrandTransferListItem[]> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ transfers: BrandTransferListItem[] }>>({
    url: "/brands/transfers/incoming",
    method: "GET",
  });
  return response.data?.data?.transfers ?? [];
}

export async function fetchOutgoingTransfers(
  accessToken: string,
): Promise<BrandTransferListItem[]> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ transfers: BrandTransferListItem[] }>>({
    url: "/brands/transfers/outgoing",
    method: "GET",
  });
  return response.data?.data?.transfers ?? [];
}

export async function submitBrandRating(
  brandId: string,
  value: number,
  accessToken: string,
): Promise<Brand> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ brand: Brand }>>({
    url: `/brands/${brandId}/rating`,
    method: "PUT",
    data: { value },
  });

  const brand = response.data?.data?.brand;
  if (!brand) throw new Error("Invalid response from brand rating API");
  return normalizeBrand(brand);
}

// ─── User search ──────────────────────────────────────────────────────────────

export async function searchUsoUsers(
  query: string,
  accessToken: string,
): Promise<UserSearchResult[]> {
  if (query.trim().length < 2) return [];
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ users: UserSearchResult[] }>>({
    url: "/users/search",
    method: "GET",
    params: { q: query },
  });
  return response.data?.data?.users ?? [];
}

// ─── Team ────────────────────────────────────────────────────────────────────

export async function fetchBrandTeamWorkspace(
  brandId: string,
  accessToken: string,
): Promise<BrandTeamWorkspace> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ workspace: BrandTeamWorkspace }>>({
    url: `/brands/${brandId}/team-workspace`,
    method: "GET",
  });

  const workspace = response.data?.data?.workspace;
  if (!workspace) {
    throw new Error("Invalid response from team workspace API");
  }

  return workspace;
}

export async function inviteBranchTeamMember(
  brandId: string,
  branchId: string,
  targetUserId: string,
  accessToken: string,
): Promise<TeamWorkspaceMember> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ membership: TeamWorkspaceMember }>>({
    url: `/brands/${brandId}/branches/${branchId}/team/invitations`,
    method: "POST",
    data: { target_user_id: targetUserId },
  });

  const membership = response.data?.data?.membership;
  if (!membership) {
    throw new Error("Invalid response from team invite API");
  }

  return membership;
}

export async function fetchBranchTeamDetail(
  brandId: string,
  branchId: string,
  accessToken: string,
): Promise<BranchTeamDetail> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ team: BranchTeamDetail }>>({
    url: `/brands/${brandId}/branches/${branchId}/team`,
    method: "GET",
  });

  const team = response.data?.data?.team;
  if (!team) {
    throw new Error("Invalid response from branch team detail API");
  }

  return team;
}

export async function removeBranchTeamMember(
  brandId: string,
  branchId: string,
  teamMemberId: string,
  accessToken: string,
): Promise<TeamWorkspaceMember> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ membership: TeamWorkspaceMember }>>({
    url: `/brands/${brandId}/branches/${branchId}/team/members/${teamMemberId}/remove`,
    method: "PATCH",
  });

  const membership = response.data?.data?.membership;
  if (!membership) {
    throw new Error("Invalid response from team member removal API");
  }

  return membership;
}

export async function fetchMyTeamInvitations(
  accessToken: string,
): Promise<TeamInvitation[]> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ invitations: TeamInvitation[] }>>({
    url: "/team-members/my-invitations",
    method: "GET",
  });

  return response.data?.data?.invitations ?? [];
}

export async function acceptTeamInvitation(
  teamMemberId: string,
  accessToken: string,
): Promise<TeamWorkspaceMember> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ membership: TeamWorkspaceMember }>>({
    url: `/team-members/${teamMemberId}/accept`,
    method: "PATCH",
  });

  const membership = response.data?.data?.membership;
  if (!membership) {
    throw new Error("Invalid response from team invitation accept API");
  }

  return membership;
}

export async function rejectTeamInvitation(
  teamMemberId: string,
  accessToken: string,
): Promise<TeamWorkspaceMember> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ membership: TeamWorkspaceMember }>>({
    url: `/team-members/${teamMemberId}/reject`,
    method: "PATCH",
  });

  const membership = response.data?.data?.membership;
  if (!membership) {
    throw new Error("Invalid response from team invitation reject API");
  }

  return membership;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function fetchNotifications(
  accessToken: string,
): Promise<AppNotification[]> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ notifications: AppNotification[] }>>({
    url: "/notifications",
    method: "GET",
  });
  return response.data?.data?.notifications ?? [];
}

export async function markNotificationRead(
  id: string,
  accessToken: string,
): Promise<void> {
  const client = createApiClient({ accessToken });
  await client.request({ url: `/notifications/${id}/read`, method: "PATCH" });
}

export async function fetchNotificationFeed(
  accessToken: string,
): Promise<NotificationFeed> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<NotificationFeed>>({
    url: "/notifications/feed",
    method: "GET",
  });

  return {
    items: response.data?.data?.items ?? [],
    meta: response.data?.data?.meta ?? {
      total_count: 0,
      unread_count: 0,
    },
  };
}

export async function dismissNotificationFeedItem(
  sourceType: NotificationFeedSourceType,
  sourceId: string,
  accessToken: string,
): Promise<void> {
  const client = createApiClient({ accessToken });
  await client.request({
    url: `/notifications/feed/items/${sourceType}/${sourceId}`,
    method: "DELETE",
  });
}

export async function clearNotificationFeed(
  accessToken: string,
): Promise<void> {
  const client = createApiClient({ accessToken });
  await client.request({
    url: "/notifications/feed/clear",
    method: "POST",
  });
}
