import { createApiClient } from "@/lib/api";
import type { ApiSuccessResponse } from "@/types";
import type {
  QueueItem,
  ModerationBrandDetail,
  ModerationServiceDetail,
  ApproveBrandPayload,
  RejectBrandPayload,
  ApproveServicePayload,
  RejectServicePayload,
} from "@/types/moderation";

export async function fetchModerationQueue(
  type: "brand" | "service" | undefined,
  accessToken: string,
): Promise<QueueItem[]> {
  const client = createApiClient({ accessToken });
  const params: Record<string, string> = {};
  if (type) params.type = type;
  const response = await client.request<ApiSuccessResponse<{ items: QueueItem[] }>>({
    url: "/admin/queue",
    method: "GET",
    params,
  });
  return response.data?.data?.items ?? [];
}

export async function fetchBrandForReview(
  id: string,
  accessToken: string,
): Promise<ModerationBrandDetail> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ brand: ModerationBrandDetail }>>({
    url: `/admin/brands/${id}`,
    method: "GET",
  });
  const brand = response.data?.data?.brand;
  if (!brand) throw new Error("Invalid response from admin brand detail API");
  return brand;
}

export async function fetchServiceForReview(
  id: string,
  accessToken: string,
): Promise<ModerationServiceDetail> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ service: ModerationServiceDetail }>>({
    url: `/admin/services/${id}`,
    method: "GET",
  });
  const service = response.data?.data?.service;
  if (!service) throw new Error("Invalid response from admin service detail API");
  return service;
}

export async function approveBrand(
  id: string,
  payload: ApproveBrandPayload,
  accessToken: string,
): Promise<ModerationBrandDetail> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ brand: ModerationBrandDetail }>>({
    url: `/admin/brands/${id}/approve`,
    method: "POST",
    data: payload,
  });
  const brand = response.data?.data?.brand;
  if (!brand) throw new Error("Invalid response from admin brand approve API");
  return brand;
}

export async function rejectBrand(
  id: string,
  payload: RejectBrandPayload,
  accessToken: string,
): Promise<ModerationBrandDetail> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ brand: ModerationBrandDetail }>>({
    url: `/admin/brands/${id}/reject`,
    method: "POST",
    data: payload,
  });
  const brand = response.data?.data?.brand;
  if (!brand) throw new Error("Invalid response from admin brand reject API");
  return brand;
}

export async function approveService(
  id: string,
  payload: ApproveServicePayload,
  accessToken: string,
): Promise<ModerationServiceDetail> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ service: ModerationServiceDetail }>>({
    url: `/admin/services/${id}/approve`,
    method: "POST",
    data: payload,
  });
  const service = response.data?.data?.service;
  if (!service) throw new Error("Invalid response from admin service approve API");
  return service;
}

export async function rejectService(
  id: string,
  payload: RejectServicePayload,
  accessToken: string,
): Promise<ModerationServiceDetail> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<{ service: ModerationServiceDetail }>>({
    url: `/admin/services/${id}/reject`,
    method: "POST",
    data: payload,
  });
  const service = response.data?.data?.service;
  if (!service) throw new Error("Invalid response from admin service reject API");
  return service;
}
