import { createApiClient } from "@/lib/api";
import type { ApiSuccessResponse } from "@/types";
import type {
  Service,
  ServiceCategory,
  AssignableService,
  AssignedService,
  ServiceAssignment,
  ServiceAssignmentRequest,
} from "@/types/service";

export type CreateServicePayload = {
  title: string;
  description?: string;
  brand_id?: string | null;
  service_category_id?: string | null;
  price?: number;
  price_type?: 'FIXED' | 'STARTING_FROM' | 'FREE';
  duration?: number;
  address?: string;
  image_media_ids?: string[];
};

export type UpdateServicePayload = Partial<CreateServicePayload>;

export type ServiceAssignmentRequestPayload = {
  proposed_description?: string | null;
  proposed_price?: number | null;
  proposed_duration?: number | null;
};

export type PaginatedMeta = {
  page: number;
  limit: number;
  total_count: number;
  has_more: boolean;
};

export function normalizeService(service: Service): Service {
  return {
    ...service,
    description: service.description ?? undefined,
    brand_id: service.brand_id ?? null,
    brand: service.brand ?? null,
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

export function normalizeServices(services: Service[] | undefined): Service[] {
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
    brand_id?: string;
    owner_id?: string;
    direct_only?: boolean;
    q?: string;
    page?: number;
    limit?: number;
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

export async function fetchPublicServicesPage(
  filters?: {
    service_category_id?: string;
    branch_id?: string;
    brand_id?: string;
    owner_id?: string;
    direct_only?: boolean;
    q?: string;
    page?: number;
    limit?: number;
  },
  accessToken?: string,
): Promise<{ services: Service[]; meta: PaginatedMeta }> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ services: Service[]; meta?: PaginatedMeta }>>({
    url: "/services",
    method: "GET",
    params: filters ?? {},
  });
  const services = normalizeServices(response.data?.data?.services);
  const meta = response.data?.data?.meta ?? {
    page: filters?.page ?? 1,
    limit: filters?.limit ?? services.length,
    total_count: services.length,
    has_more: false,
  };
  return { services, meta };
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

// ─── Team-member service assignment ──────────────────────────────────────────

export async function fetchAssignableBrandServices(
  brandId: string,
  accessToken: string,
): Promise<AssignableService[]> {
  const client = createApiClient({ accessToken });
  const response = await client.request<
    ApiSuccessResponse<{ services: AssignableService[] }>
  >({
    url: `/brands/${brandId}/assignable-services`,
    method: "GET",
  });
  return response.data?.data?.services ?? [];
}

export async function requestServiceAssignment(
  brandId: string,
  serviceId: string,
  accessToken: string,
  payload?: ServiceAssignmentRequestPayload,
): Promise<ServiceAssignment> {
  const client = createApiClient({ accessToken });
  const response = await client.request<
    ApiSuccessResponse<{ assignment: ServiceAssignment }>
  >({
    url: `/brands/${brandId}/services/${serviceId}/assignment-request`,
    method: "POST",
    data: payload,
  });
  const assignment = response.data?.data?.assignment;
  if (!assignment) throw new Error("Invalid response from assignment request API");
  return assignment;
}

export async function fetchBrandServiceAssignmentRequests(
  brandId: string,
  accessToken: string,
): Promise<ServiceAssignmentRequest[]> {
  const client = createApiClient({ accessToken });
  const response = await client.request<
    ApiSuccessResponse<{ requests: ServiceAssignmentRequest[] }>
  >({
    url: `/brands/${brandId}/service-assignment-requests`,
    method: "GET",
  });
  return response.data?.data?.requests ?? [];
}

export async function withdrawServiceAssignment(
  assignmentId: string,
  accessToken: string,
): Promise<ServiceAssignment> {
  const client = createApiClient({ accessToken });
  const response = await client.request<
    ApiSuccessResponse<{ assignment: ServiceAssignment }>
  >({
    url: `/team-member-services/${assignmentId}`,
    method: "DELETE",
  });
  const assignment = response.data?.data?.assignment;
  if (!assignment) throw new Error("Invalid response from assignment withdraw API");
  return assignment;
}

export async function approveServiceAssignment(
  assignmentId: string,
  accessToken: string,
): Promise<ServiceAssignment> {
  const client = createApiClient({ accessToken });
  const response = await client.request<
    ApiSuccessResponse<{ assignment: ServiceAssignment }>
  >({
    url: `/team-member-services/${assignmentId}/approve`,
    method: "PATCH",
  });
  const assignment = response.data?.data?.assignment;
  if (!assignment) throw new Error("Invalid response from assignment approve API");
  return assignment;
}

export async function rejectServiceAssignment(
  assignmentId: string,
  accessToken: string,
): Promise<ServiceAssignment> {
  const client = createApiClient({ accessToken });
  const response = await client.request<
    ApiSuccessResponse<{ assignment: ServiceAssignment }>
  >({
    url: `/team-member-services/${assignmentId}/reject`,
    method: "PATCH",
  });
  const assignment = response.data?.data?.assignment;
  if (!assignment) throw new Error("Invalid response from assignment reject API");
  return assignment;
}

export async function fetchMyAssignedServices(
  accessToken: string,
): Promise<AssignedService[]> {
  const client = createApiClient({ accessToken });
  const response = await client.request<
    ApiSuccessResponse<{ assignments: AssignedService[] }>
  >({
    url: "/services/assigned/mine",
    method: "GET",
  });
  return response.data?.data?.assignments ?? [];
}
