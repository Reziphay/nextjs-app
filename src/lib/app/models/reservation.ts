export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'CANCELLED_BY_CUSTOMER'
  | 'CANCELLED_BY_OWNER'
  | 'CHANGE_REQUESTED_BY_CUSTOMER'
  | 'CHANGE_REQUESTED_BY_OWNER'
  | 'COMPLETED'
  | 'NO_SHOW'
  | 'EXPIRED';

export function isActiveStatus(status: ReservationStatus): boolean {
  return status === 'PENDING' || status === 'CONFIRMED';
}

export function isCancellableStatus(status: ReservationStatus): boolean {
  return status === 'PENDING' || status === 'CONFIRMED';
}

export function isFinishedStatus(status: ReservationStatus): boolean {
  return (
    status === 'COMPLETED' ||
    status === 'NO_SHOW' ||
    status === 'EXPIRED' ||
    status === 'REJECTED' ||
    status === 'CANCELLED_BY_CUSTOMER' ||
    status === 'CANCELLED_BY_OWNER'
  );
}

export type ReservationServiceRef = {
  id: string;
  name: string;
  approvalMode: 'AUTO' | 'MANUAL';
  price: number | null;
  currency: string | null;
  waitingTimeMinutes: number | null;
  freeCancellationDeadlineHours: number | null;
  thumbnailUrl: string | null;
};

export type ReservationBrandRef = {
  id: string;
  name: string;
  logoUrl: string | null;
};

export type ReservationUserRef = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  phone: string;
};

export type ChangeRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export type ReservationChangeRequest = {
  id: string;
  requestedStartAt: string;
  requestedEndAt: string;
  reason: string | null;
  status: ChangeRequestStatus;
  createdAt: string;
  initiatedBy: 'CUSTOMER' | 'OWNER';
};

export type ReservationItem = {
  id: string;
  status: ReservationStatus;
  startAt: string;
  endAt: string;
  note: string | null;
  service: ReservationServiceRef;
  brand: ReservationBrandRef | null;
  customer: ReservationUserRef;
  owner: ReservationUserRef;
  changeRequests: ReservationChangeRequest[];
  completionQrToken: string | null;
  createdAt: string;
};

export type CreateReservationDto = {
  serviceId: string;
  startAt: string;
  note?: string;
};
