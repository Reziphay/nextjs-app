import { createApiClient } from "@/lib/api";
import type { ApiSuccessResponse, Brand } from "@/types";
import type { Service } from "@/types/service";

export type MarketplaceFacet = {
  id: string;
  key: string;
  count: number;
};

export type MarketplaceFacets = {
  service_categories: MarketplaceFacet[];
  brand_categories: MarketplaceFacet[];
};

export type MarketplaceHomeUso = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  type: "uso";
  avatar_url?: string | null;
  rating: number | null;
  rating_count: number;
};

export type MarketplaceHomeSections = {
  random_services: Service[];
  smart_services: Service[];
  recent_services: Service[];
  recent_brands: Brand[];
  recommended_services: Service[];
  recommended_brands: Brand[];
  top_rated_services: Service[];
  top_rated_brands: Brand[];
  top_usos: MarketplaceHomeUso[];
};

export const EMPTY_MARKETPLACE_HOME: MarketplaceHomeSections = {
  random_services: [],
  smart_services: [],
  recent_services: [],
  recent_brands: [],
  recommended_services: [],
  recommended_brands: [],
  top_rated_services: [],
  top_rated_brands: [],
  top_usos: [],
};

export async function fetchMarketplaceFacets(
  accessToken?: string,
): Promise<MarketplaceFacets> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<MarketplaceFacets>>({
    url: "/marketplace/facets",
    method: "GET",
  });

  return {
    service_categories: response.data?.data?.service_categories ?? [],
    brand_categories: response.data?.data?.brand_categories ?? [],
  };
}

export async function fetchMarketplaceHome(
  accessToken: string,
): Promise<MarketplaceHomeSections> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<MarketplaceHomeSections>>({
    url: "/marketplace/home",
    method: "GET",
  });

  return {
    ...EMPTY_MARKETPLACE_HOME,
    ...(response.data?.data ?? {}),
  };
}
