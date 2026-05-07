import { createApiClient } from "@/lib/api";
import { normalizeBrand } from "@/lib/brands-api";
import { normalizeService } from "@/lib/services-api";
import type { ApiSuccessResponse, Brand } from "@/types";
import type { Service } from "@/types/service";

export type FavoriteCollection = {
  brands: Brand[];
  services: Service[];
  service_brands: Brand[];
  brand_ids: string[];
  service_ids: string[];
};

const EMPTY_FAVORITES: FavoriteCollection = {
  brands: [],
  services: [],
  service_brands: [],
  brand_ids: [],
  service_ids: [],
};

function normalizeFavoriteCollection(collection?: Partial<FavoriteCollection>): FavoriteCollection {
  return {
    brands: (collection?.brands ?? []).map(normalizeBrand),
    services: (collection?.services ?? []).map(normalizeService),
    service_brands: (collection?.service_brands ?? []).map(normalizeBrand),
    brand_ids: collection?.brand_ids ?? [],
    service_ids: collection?.service_ids ?? [],
  };
}

export function emptyFavorites(): FavoriteCollection {
  return EMPTY_FAVORITES;
}

export async function fetchFavorites(accessToken: string): Promise<FavoriteCollection> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<FavoriteCollection>>({
    url: "/favorites",
    method: "GET",
  });

  return normalizeFavoriteCollection(response.data?.data);
}

export async function addFavoriteBrand(
  brandId: string,
  accessToken: string,
): Promise<void> {
  const client = createApiClient({ accessToken });
  await client.request({ url: `/favorites/brands/${brandId}`, method: "POST" });
}

export async function removeFavoriteBrand(
  brandId: string,
  accessToken: string,
): Promise<void> {
  const client = createApiClient({ accessToken });
  await client.request({ url: `/favorites/brands/${brandId}`, method: "DELETE" });
}

export async function addFavoriteService(
  serviceId: string,
  accessToken: string,
): Promise<void> {
  const client = createApiClient({ accessToken });
  await client.request({ url: `/favorites/services/${serviceId}`, method: "POST" });
}

export async function removeFavoriteService(
  serviceId: string,
  accessToken: string,
): Promise<void> {
  const client = createApiClient({ accessToken });
  await client.request({ url: `/favorites/services/${serviceId}`, method: "DELETE" });
}
