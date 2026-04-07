import { createApiClient } from "@/lib/api";
import type { Brand, BrandCategory, Branch } from "@/types/brand";
import type { ApiSuccessResponse } from "@/types";

export type CreateBrandPayload = {
  name: string;
  description?: string;
  categoryIds?: string[];
  logo_media_id?: string;
  gallery_media_ids?: string[];
  branches?: BranchPayload[];
};

export type UpdateBrandPayload = {
  name?: string;
  description?: string | null;
  categoryIds?: string[];
  /** Set to null to remove the logo; omit to leave unchanged. */
  logo_media_id?: string | null;
  /** Full ordered list of media IDs (existing + new). Omit to leave gallery unchanged. */
  gallery_media_ids?: string[];
};

export type BranchPayload = {
  name: string;
  description?: string;
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
  address1?: string;
  address2?: string | null;
  phone?: string | null;
  email?: string | null;
  is_24_7?: boolean;
  opening?: string | null;
  closing?: string | null;
  breaks?: { start: string; end: string }[];
};

export type DeleteBrandPayload = {
  service_handling?: "delete";
};

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

function normalizeBranch(branch: Branch): Branch {
  return {
    ...branch,
    description: branch.description ?? undefined,
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
): Promise<{ media_id: string; url: string }> {
  const client = createApiClient({ accessToken });
  const formData = new FormData();
  formData.append("file", file);
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
