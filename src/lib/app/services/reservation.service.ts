import { api } from '../api/client';
import { E } from '../api/endpoints';
import type { ReservationItem, CreateReservationDto, ReservationStatus } from '../models/reservation';

export const reservationService = {
  // UCR
  async createReservation(dto: CreateReservationDto): Promise<ReservationItem> {
    return api.post<ReservationItem>(E.createReservation, dto);
  },

  async fetchMyReservations(status?: ReservationStatus): Promise<ReservationItem[]> {
    const url = status ? `${E.myReservations}?status=${status}` : E.myReservations;
    return api.get<ReservationItem[]>(url);
  },

  async fetchReservationDetail(id: string): Promise<ReservationItem> {
    return api.get<ReservationItem>(E.reservationById(id));
  },

  async cancelReservation(id: string, reason?: string): Promise<ReservationItem> {
    return api.post<ReservationItem>(E.cancelReservation(id), { reason });
  },

  async acceptChangeRequest(crId: string): Promise<ReservationItem> {
    return api.post<ReservationItem>(E.acceptChangeRequest(crId));
  },

  async rejectChangeRequest(crId: string): Promise<ReservationItem> {
    return api.post<ReservationItem>(E.rejectChangeRequest(crId));
  },

  async createChangeRequest(
    reservationId: string,
    requestedStartAt: string,
    requestedEndAt: string,
    reason?: string,
  ): Promise<ReservationItem> {
    return api.post<ReservationItem>(E.createChangeRequest(reservationId), {
      requestedStartAt,
      requestedEndAt,
      reason,
    });
  },

  // USO
  async fetchIncomingReservations(status?: ReservationStatus): Promise<ReservationItem[]> {
    const url = status
      ? `${E.incomingReservations}?status=${status}`
      : E.incomingReservations;
    return api.get<ReservationItem[]>(url);
  },

  async fetchIncomingStats(): Promise<Record<string, number>> {
    return api.get<Record<string, number>>(E.incomingStats);
  },

  async acceptReservation(id: string): Promise<ReservationItem> {
    return api.post<ReservationItem>(E.acceptReservation(id));
  },

  async rejectReservation(id: string, reason?: string): Promise<ReservationItem> {
    return api.post<ReservationItem>(E.rejectReservation(id), { reason });
  },

  async cancelByOwner(id: string, reason?: string): Promise<ReservationItem> {
    return api.post<ReservationItem>(E.cancelByOwner(id), { reason });
  },

  async completeManually(id: string): Promise<ReservationItem> {
    return api.post<ReservationItem>(E.completeManually(id));
  },
};
