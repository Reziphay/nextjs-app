import { createApiClient } from "@/lib/api";
import { toPlainTextPreview } from "@/lib/rich-text";
import type { ApiSuccessResponse } from "@/types";

export type MarketplaceSearchItemType = "brand" | "branch" | "service" | "uso" | "address";

export type MarketplaceSearchItem = {
  id: string;
  type: MarketplaceSearchItemType;
  title: string;
  subtitle: string;
  image_url: string | null;
  href: string;
  category_id: string | null;
  category_key: string | null;
  rating: number | null;
  rating_count: number;
};

export type MarketplaceSearchResults = {
  query: string;
  suggestions: MarketplaceSearchItem[];
  results: {
    brands: MarketplaceSearchItem[];
    branches: MarketplaceSearchItem[];
    services: MarketplaceSearchItem[];
    users: MarketplaceSearchItem[];
    addresses: MarketplaceSearchItem[];
  };
};

function normalizeSearchItem(item: MarketplaceSearchItem): MarketplaceSearchItem {
  return {
    ...item,
    title: toPlainTextPreview(item.title),
    subtitle: toPlainTextPreview(item.subtitle),
  };
}

function normalizeSearchResults(data: MarketplaceSearchResults): MarketplaceSearchResults {
  return {
    ...data,
    suggestions: data.suggestions.map(normalizeSearchItem),
    results: {
      brands: data.results.brands.map(normalizeSearchItem),
      branches: data.results.branches.map(normalizeSearchItem),
      services: data.results.services.map(normalizeSearchItem),
      users: data.results.users.map(normalizeSearchItem),
      addresses: data.results.addresses.map(normalizeSearchItem),
    },
  };
}

export async function searchMarketplace(
  query: string,
  accessToken?: string,
  options?: {
    type?: string;
    category?: string;
    sort?: string;
    limit?: number;
  },
): Promise<MarketplaceSearchResults> {
  if (query.trim().length < 2) {
    return {
      query,
      suggestions: [],
      results: { brands: [], branches: [], services: [], users: [], addresses: [] },
    };
  }

  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<MarketplaceSearchResults>>({
    url: "/marketplace/search",
    method: "GET",
    params: {
      q: query,
      ...(options?.type && options.type !== "all" && { type: options.type }),
      ...(options?.category && { category: options.category }),
      ...(options?.sort && { sort: options.sort }),
      ...(options?.limit && { limit: options.limit }),
    },
  });

  const fallback = {
    query,
    suggestions: [],
    results: { brands: [], branches: [], services: [], users: [], addresses: [] },
  };

  return normalizeSearchResults(response.data?.data ?? fallback);
}
