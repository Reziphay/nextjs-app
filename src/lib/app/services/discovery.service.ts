import { api } from '../api/client';
import { E } from '../api/endpoints';
import type { CategoryItem } from '../models/category';
import type {
  ServiceItem,
  BrandItem,
  ProviderItem,
  ServiceListResult,
  BrandListResult,
  ProviderListResult,
  SearchQuery,
} from '../models/discovery';

type SearchResults = {
  services: ServiceListResult;
  brands: BrandListResult;
  providers: ProviderListResult;
};

export const discoveryService = {
  async fetchCategories(): Promise<CategoryItem[]> {
    return api.get<CategoryItem[]>(E.categories);
  },

  async search(q: SearchQuery): Promise<SearchResults> {
    const params = new URLSearchParams();
    if (q.query) params.set('q', q.query);
    if (q.categoryId) params.set('categoryId', q.categoryId);
    if (q.minPrice !== undefined) params.set('minPrice', String(q.minPrice));
    if (q.maxPrice !== undefined) params.set('maxPrice', String(q.maxPrice));
    if (q.sortBy) params.set('sortBy', q.sortBy);
    if (q.lat !== undefined) params.set('lat', String(q.lat));
    if (q.lng !== undefined) params.set('lng', String(q.lng));
    if (q.radiusKm !== undefined) params.set('radiusKm', String(q.radiusKm));
    if (q.limit !== undefined) params.set('limit', String(q.limit));
    if (q.cursor) params.set('cursor', q.cursor);
    const qs = params.toString();
    return api.get<SearchResults>(`${E.search}${qs ? `?${qs}` : ''}`);
  },

  async fetchServices(params?: {
    limit?: number;
    cursor?: string;
    lat?: number;
    lng?: number;
    radiusKm?: number;
  }): Promise<ServiceListResult> {
    const p = new URLSearchParams();
    if (params?.limit) p.set('limit', String(params.limit));
    if (params?.cursor) p.set('cursor', params.cursor);
    if (params?.lat !== undefined) p.set('lat', String(params.lat));
    if (params?.lng !== undefined) p.set('lng', String(params.lng));
    if (params?.radiusKm !== undefined) p.set('radiusKm', String(params.radiusKm));
    const qs = p.toString();
    return api.get<ServiceListResult>(`${E.services}${qs ? `?${qs}` : ''}`);
  },

  async fetchNearbyServices(
    lat: number,
    lng: number,
    radiusKm = 5,
    limit = 20,
  ): Promise<ServiceListResult> {
    const p = new URLSearchParams({ lat: String(lat), lng: String(lng), radiusKm: String(radiusKm), limit: String(limit) });
    return api.get<ServiceListResult>(`${E.nearbyServices}?${p}`);
  },

  async fetchBrands(params?: { limit?: number; cursor?: string }): Promise<BrandListResult> {
    const p = new URLSearchParams();
    if (params?.limit) p.set('limit', String(params.limit));
    if (params?.cursor) p.set('cursor', params.cursor);
    const qs = p.toString();
    return api.get<BrandListResult>(`${E.brands}${qs ? `?${qs}` : ''}`);
  },

  async fetchServiceDetail(id: string): Promise<ServiceItem> {
    return api.get<ServiceItem>(E.serviceById(id));
  },

  async fetchBrandDetail(id: string): Promise<BrandItem> {
    return api.get<BrandItem>(E.brandById(id));
  },

  async fetchBrandServices(brandId: string): Promise<ServiceListResult> {
    return api.get<ServiceListResult>(`${E.services}?brandId=${brandId}`);
  },

  async fetchProviderServices(ownerUserId: string): Promise<ServiceListResult> {
    return api.get<ServiceListResult>(`${E.services}?ownerUserId=${ownerUserId}`);
  },

  // USO — own services / brands
  async fetchMyServices(): Promise<ServiceListResult> {
    return api.get<ServiceListResult>(E.myServices);
  },

  async fetchMyBrands(): Promise<BrandListResult> {
    return api.get<BrandListResult>(E.myBrands);
  },

  // Favorites status
  async getFavoriteServiceStatus(id: string): Promise<boolean> {
    const r = await api.get<{ isFavorite: boolean }>(E.favoriteServiceStatus(id));
    return r.isFavorite;
  },
  async toggleFavoriteService(id: string, add: boolean): Promise<void> {
    if (add) await api.post(E.addFavoriteService(id));
    else await api.delete(E.removeFavoriteService(id));
  },

  async getFavoriteBrandStatus(id: string): Promise<boolean> {
    const r = await api.get<{ isFavorite: boolean }>(E.favoriteBrandStatus(id));
    return r.isFavorite;
  },
  async toggleFavoriteBrand(id: string, add: boolean): Promise<void> {
    if (add) await api.post(E.addFavoriteBrand(id));
    else await api.delete(E.removeFavoriteBrand(id));
  },

  async getFavoriteOwnerStatus(id: string): Promise<boolean> {
    const r = await api.get<{ isFavorite: boolean }>(E.favoriteOwnerStatus(id));
    return r.isFavorite;
  },
  async toggleFavoriteOwner(id: string, add: boolean): Promise<void> {
    if (add) await api.post(E.addFavoriteOwner(id));
    else await api.delete(E.removeFavoriteOwner(id));
  },

  async fetchFavoriteServices(): Promise<ServiceItem[]> {
    return api.get<ServiceItem[]>(E.favoriteServices);
  },
  async fetchFavoriteBrands(): Promise<BrandItem[]> {
    return api.get<BrandItem[]>(E.favoriteBrands);
  },
  async fetchFavoriteOwners(): Promise<ProviderItem[]> {
    return api.get<ProviderItem[]>(E.favoriteOwners);
  },

  // USO — create / update / archive services
  async createService(data: Partial<ServiceItem> & { name: string }): Promise<ServiceItem> {
    return api.post<ServiceItem>(E.createService, data);
  },

  async updateService(id: string, data: Partial<ServiceItem>): Promise<ServiceItem> {
    return api.patch<ServiceItem>(E.updateService(id), data);
  },

  async archiveService(id: string): Promise<void> {
    return api.delete(E.archiveService(id));
  },

  async uploadServicePhoto(id: string, file: File): Promise<{ id: string; url: string }> {
    return api.upload<{ id: string; url: string }>(E.servicePhotos(id), file, 'photo');
  },

  async deleteServicePhoto(id: string, photoId: string): Promise<void> {
    return api.delete(E.deleteServicePhoto(id, photoId));
  },

  // USO — create / update / delete brands
  async createBrand(data: { name: string; description?: string; email?: string; phone?: string; website?: string }): Promise<BrandItem> {
    return api.post<BrandItem>(E.createBrand, data);
  },

  async updateBrand(id: string, data: Partial<BrandItem>): Promise<BrandItem> {
    return api.patch<BrandItem>(E.updateBrand(id), data);
  },

  async deleteBrand(id: string): Promise<void> {
    return api.delete(E.deleteBrand(id));
  },

  async uploadBrandLogo(id: string, file: File): Promise<BrandItem> {
    return api.upload<BrandItem>(E.uploadBrandLogo(id), file, 'logo');
  },
};
