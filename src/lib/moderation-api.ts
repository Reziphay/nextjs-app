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

type ModerationQueueResponse = {
  items?: QueueItem[];
  brands?: Array<Omit<QueueItem, "type" | "title"> & { type?: "brand"; title?: string; name?: string }>;
  services?: Array<Omit<QueueItem, "type"> & { type?: "service" }>;
};

function normalizeModerationQueue(data?: ModerationQueueResponse): QueueItem[] {
  if (!data) return [];
  if (Array.isArray(data.items)) return data.items;

  const brands =
    data.brands?.map((brand) => ({
      ...brand,
      type: "brand" as const,
      title: brand.title ?? brand.name ?? "",
    })) ?? [];
  const services =
    data.services?.map((service) => ({
      ...service,
      type: "service" as const,
    })) ?? [];

  return [...brands, ...services].sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export async function fetchModerationQueue(
  type: "brand" | "service" | undefined,
  accessToken: string,
): Promise<QueueItem[]> {
  const client = createApiClient({ accessToken });
  const params: Record<string, string> = {};
  if (type) params.type = type;
  const response = await client.request<ApiSuccessResponse<ModerationQueueResponse>>({
    url: "/admin/queue",
    method: "GET",
    params,
  });
  return normalizeModerationQueue(response.data?.data);
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
): Promise<void> {
  const client = createApiClient({ accessToken });
  await client.request<ApiSuccessResponse>({
    url: `/admin/brands/${id}/approve`,
    method: "POST",
    data: payload,
  });
}

export async function rejectBrand(
  id: string,
  payload: RejectBrandPayload,
  accessToken: string,
): Promise<void> {
  const client = createApiClient({ accessToken });
  await client.request<ApiSuccessResponse>({
    url: `/admin/brands/${id}/reject`,
    method: "POST",
    data: payload,
  });
}

export async function approveService(
  id: string,
  payload: ApproveServicePayload,
  accessToken: string,
): Promise<void> {
  const client = createApiClient({ accessToken });
  await client.request<ApiSuccessResponse>({
    url: `/admin/services/${id}/approve`,
    method: "POST",
    data: payload,
  });
}

export async function rejectService(
  id: string,
  payload: RejectServicePayload,
  accessToken: string,
): Promise<void> {
  const client = createApiClient({ accessToken });
  await client.request<ApiSuccessResponse>({
    url: `/admin/services/${id}/reject`,
    method: "POST",
    data: payload,
  });
}
