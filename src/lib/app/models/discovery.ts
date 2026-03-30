export type ServicePhoto = {
  id: string;
  url: string;
  sortOrder: number;
};

export type AddressItem = {
  id: string;
  label: string | null;
  fullAddress: string;
  country: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
};

export type RatingStats = {
  avgRating: number;
  reviewCount: number;
};

export type DiscoveryOwner = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  ratingStats: RatingStats | null;
};

export type DiscoveryCategoryRef = {
  id: string;
  name: string;
  slug: string;
};

export type DiscoveryBrandRef = {
  id: string;
  name: string;
  logoUrl: string | null;
};

export type VisibilityLabel = {
  id: string;
  name: string;
  slug: string;
};

export type ServiceItem = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  approvalMode: 'AUTO' | 'MANUAL';
  serviceType: 'SOLO' | 'MULTI';
  waitingTimeMinutes: number | null;
  minAdvanceBookingHours: number | null;
  maxAdvanceBookingHours: number | null;
  freeCancellationDeadlineHours: number | null;
  photos: ServicePhoto[];
  address: AddressItem | null;
  category: DiscoveryCategoryRef | null;
  brand: DiscoveryBrandRef | null;
  owner: DiscoveryOwner;
  ratingStats: RatingStats | null;
  visibilityLabels: VisibilityLabel[];
  distanceKm: number | null;
};

export type BrandItem = {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: AddressItem | null;
  owner: DiscoveryOwner;
  ratingStats: RatingStats | null;
  visibilityLabels: VisibilityLabel[];
  servicesCount: number;
};

export type ProviderItem = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  ratingStats: RatingStats | null;
  servicesCount: number;
  brandsCount: number;
};

export type PageInfo = {
  cursor: string | null;
  hasMore: boolean;
  limit: number;
};

export type ServiceListResult = {
  items: ServiceItem[];
  pageInfo: PageInfo;
};

export type BrandListResult = {
  items: BrandItem[];
  pageInfo: PageInfo;
};

export type ProviderListResult = {
  items: ProviderItem[];
  pageInfo: PageInfo;
};

export type SearchResults = {
  services: ServiceListResult;
  brands: BrandListResult;
  providers: ProviderListResult;
};

export type SortBy =
  | 'RELEVANCE'
  | 'HIGHEST_RATED'
  | 'NEAREST_FIRST'
  | 'PRICE_LOW_HIGH'
  | 'PRICE_HIGH_LOW'
  | 'MOST_POPULAR';

export type SearchQuery = {
  query: string;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: SortBy;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  limit?: number;
  cursor?: string;
};
