import { createApiClient } from "@/lib/api";
import type { ApiSuccessResponse } from "@/types";
import type { Service, ServiceCategory } from "@/types/service";

export type CreateServicePayload = {
  title: string;
  description?: string;
  branch_id?: string | null;
  service_category_id?: string | null;
  price?: number;
  price_type?: 'FIXED' | 'STARTING_FROM' | 'FREE';
  duration?: number;
  address?: string;
  image_media_ids?: string[];
};

export type UpdateServicePayload = Partial<CreateServicePayload>;

function normalizeService(service: Service): Service {
  return {
    ...service,
    description: service.description ?? undefined,
    branch_id: service.branch_id ?? null,
    service_category_id: service.service_category_id ?? null,
    service_category: service.service_category ?? null,
    price: service.price ?? null,
    duration: service.duration ?? null,
    address: service.address ?? undefined,
    rejection_reason: service.rejection_reason ?? undefined,
    images: service.images ?? [],
    rating: service.rating ?? null,
    rating_count: service.rating_count ?? 0,
    my_rating: service.my_rating ?? null,
  };
}

function normalizeServices(services: Service[] | undefined): Service[] {
  return (services ?? []).map(normalizeService);
}

export async function fetchMyServices(accessToken: string): Promise<Service[]> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ services: Service[] }>>({
    url: "/services/mine",
    method: "GET",
  });
  return normalizeServices(response.data?.data?.services);
}

export async function fetchServiceById(
  id: string,
  accessToken?: string,
): Promise<Service | null> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ service: Service }>>({
    url: `/services/${id}`,
    method: "GET",
  });
  const service = response.data?.data?.service;
  return service ? normalizeService(service) : null;
}

export async function fetchPublicServices(
  filters?: {
    service_category_id?: string;
    branch_id?: string;
    owner_id?: string;
    direct_only?: boolean;
    q?: string;
  },
  accessToken?: string,
): Promise<Service[]> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ services: Service[] }>>({
    url: "/services",
    method: "GET",
    params: filters ?? {},
  });
  return normalizeServices(response.data?.data?.services);
}

export async function createService(
  payload: CreateServicePayload,
  accessToken: string,
): Promise<Service> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ service: Service }>>({
    url: "/services",
    method: "POST",
    data: payload,
  });
  const service = response.data?.data?.service;
  if (!service) throw new Error("Invalid response from create service API");
  return normalizeService(service);
}

export async function updateService(
  id: string,
  payload: UpdateServicePayload,
  accessToken: string,
): Promise<Service> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ service: Service }>>({
    url: `/services/${id}`,
    method: "PATCH",
    data: payload,
  });
  const service = response.data?.data?.service;
  if (!service) throw new Error("Invalid response from update service API");
  return normalizeService(service);
}

export async function deleteService(
  id: string,
  accessToken: string,
): Promise<void> {
  const client = createApiClient({ accessToken });
  await client.request({
    url: `/services/${id}`,
    method: "DELETE",
  });
}

export async function submitService(
  id: string,
  accessToken: string,
): Promise<Service> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ service: Service }>>({
    url: `/services/${id}/submit`,
    method: "POST",
  });
  const service = response.data?.data?.service;
  if (!service) throw new Error("Invalid response from submit service API");
  return normalizeService(service);
}

export async function pauseService(
  id: string,
  accessToken: string,
): Promise<Service> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ service: Service }>>({
    url: `/services/${id}/pause`,
    method: "POST",
  });
  const service = response.data?.data?.service;
  if (!service) throw new Error("Invalid response from pause service API");
  return normalizeService(service);
}

export async function resumeService(
  id: string,
  accessToken: string,
): Promise<Service> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ service: Service }>>({
    url: `/services/${id}/resume`,
    method: "POST",
  });
  const service = response.data?.data?.service;
  if (!service) throw new Error("Invalid response from resume service API");
  return normalizeService(service);
}

export async function archiveService(
  id: string,
  accessToken: string,
): Promise<Service> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ service: Service }>>({
    url: `/services/${id}/archive`,
    method: "POST",
  });
  const service = response.data?.data?.service;
  if (!service) throw new Error("Invalid response from archive service API");
  return normalizeService(service);
}

export async function unarchiveService(
  id: string,
  accessToken: string,
): Promise<Service> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ service: Service }>>({
    url: `/services/${id}/unarchive`,
    method: "POST",
  });
  const service = response.data?.data?.service;
  if (!service) throw new Error("Invalid response from unarchive service API");
  return normalizeService(service);
}

export async function submitServiceRating(
  serviceId: string,
  value: number,
  accessToken: string,
): Promise<Service> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ service: Service }>>({
    url: `/services/${serviceId}/rating`,
    method: "PUT",
    data: { value },
  });
  const service = response.data?.data?.service;
  if (!service) throw new Error("Invalid response from service rating API");
  return normalizeService(service);
}

export async function fetchServiceCategories(
  accessToken?: string,
): Promise<ServiceCategory[]> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ categories: ServiceCategory[] }>>({
    url: "/service-categories",
    method: "GET",
  });
  return response.data?.data?.categories ?? [];
}

export async function uploadServiceMedia(
  file: File,
  accessToken: string,
): Promise<{ media_id: string; url: string }> {
  const client = createApiClient({ accessToken });
  const formData = new FormData();
  formData.append("file", file);
  const response = await client.request<ApiSuccessResponse<{ media_id: string; url: string }>>({
    url: "/services/media",
    method: "POST",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  });
  const data = response.data?.data;
  if (!data?.media_id) throw new Error("Invalid response from service media upload API");
  return data;
}
