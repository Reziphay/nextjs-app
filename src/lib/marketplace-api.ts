import { createApiClient } from "@/lib/api";
import type { ApiSuccessResponse } from "@/types";

export type MarketplaceFacet = {
  id: string;
  key: string;
  count: number;
};

export type MarketplaceFacets = {
  service_categories: MarketplaceFacet[];
  brand_categories: MarketplaceFacet[];
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
