import { createApiClient } from "@/lib/api";
import type { ApiSuccessResponse } from "@/types/user_types";
import type {
  Reservation,
  AvailabilityResult,
} from "@/types/reservation";

export type ReservationRole = "customer" | "provider";

export async function fetchAvailability(
  params: { service_id: string; date: string; provider_user_id?: string },
  accessToken: string,
): Promise<AvailabilityResult> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<AvailabilityResult>>({
    url: "/availability",
    method: "GET",
    params,
  });
  return response.data?.data ?? { date: params.date, providers: [] };
}

export async function createReservation(
  payload: { service_id: string; starts_at: string; provider_user_id?: string | null; branch_id?: string | null },
  accessToken: string,
): Promise<Reservation> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<Reservation>>({
    url: "/reservations",
    method: "POST",
    data: payload,
  });
  const reservation = response.data?.data;
  if (!reservation) throw new Error("Invalid response from create reservation API");
  return reservation;
}

// UCR rates the USO (provider) they had a completed reservation with.
export async function rateProvider(
  providerUserId: string,
  value: number,
  accessToken: string,
): Promise<void> {
  const client = createApiClient({ accessToken });
  await client.request({
    url: `/providers/${providerUserId}/rating`,
    method: "POST",
    data: { value },
  });
}

// USO rates the UCR (customer) they had a completed reservation with.
export async function rateCustomer(
  customerUserId: string,
  value: number,
  accessToken: string,
): Promise<void> {
  const client = createApiClient({ accessToken });
  await client.request({
    url: `/customers/${customerUserId}/rating`,
    method: "POST",
    data: { value },
  });
}

export async function fetchMyReservations(
  role: ReservationRole,
  accessToken: string,
): Promise<Reservation[]> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<Reservation[]>>({
    url: "/reservations/mine",
    method: "GET",
    params: { role },
  });
  return response.data?.data ?? [];
}

async function transition(
  id: string,
  action: "confirm" | "cancel" | "reject" | "complete" | "no-show",
  accessToken: string,
  body?: { cancel_reason?: string },
): Promise<Reservation> {
  const client = createApiClient({ accessToken });
  const response = await client.request<ApiSuccessResponse<Reservation>>({
    url: `/reservations/${id}/${action}`,
    method: "POST",
    data: body ?? {},
  });
  const reservation = response.data?.data;
  if (!reservation) throw new Error(`Invalid response from reservation ${action} API`);
  return reservation;
}

export const confirmReservation = (id: string, accessToken: string) =>
  transition(id, "confirm", accessToken);

export const cancelReservation = (id: string, accessToken: string, reason?: string) =>
  transition(id, "cancel", accessToken, { cancel_reason: reason });

export const rejectReservation = (id: string, accessToken: string, reason?: string) =>
  transition(id, "reject", accessToken, { cancel_reason: reason });

export const completeReservation = (id: string, accessToken: string) =>
  transition(id, "complete", accessToken);

export const markNoShow = (id: string, accessToken: string) =>
  transition(id, "no-show", accessToken);

