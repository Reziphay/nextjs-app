import { createApiClient } from "@/lib/api";
import type { Brand, BrandCategory } from "@/types/brand";
import type { ApiSuccessResponse } from "@/types";

export type CreateBrandPayload = {
  name: string;
  description?: string;
  category_ids?: string[];
  branches?: BranchPayload[];
};

export type UpdateBrandPayload = Partial<CreateBrandPayload>;

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

function normalizeBrand(brand: Brand): Brand {
  return {
    ...brand,
    categories: brand.categories ?? [],
    gallery: brand.gallery ?? [],
    branches: brand.branches ?? [],
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

  if (!brand) {
    throw new Error("Invalid response from create brand API");
  }

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

  if (!brand) {
    throw new Error("Invalid response from update brand API");
  }

  return normalizeBrand(brand);
}
