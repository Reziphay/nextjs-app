export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED_BY_UCR"
  | "CANCELLED_BY_USO"
  | "COMPLETED"
  | "NO_SHOW";

export type ReservationParty = {
  id: string;
  first_name: string;
  last_name: string;
};

export type ReservationServiceRef = {
  id: string;
  title: string;
  duration: number | null;
};

export type Reservation = {
  id: string;
  service_id: string;
  provider_user_id: string;
  ucr_id: string;
  branch_id: string | null;
  starts_at: string;
  ends_at: string;
  status: ReservationStatus;
  price_snapshot: number | null;
  currency: string;
  cancel_reason: string | null;
  // 6-digit code; only the UCR receives it (null for the provider).
  confirmation_code?: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
  service?: ReservationServiceRef;
  provider?: ReservationParty;
  ucr?: ReservationParty;
};

export type Slot = {
  starts_at: string;
  ends_at: string;
};

export type ProviderSlots = {
  provider_user_id: string;
  slots: Slot[];
};

export type AvailabilityResult = {
  date: string;
  providers: ProviderSlots[];
};

export type ScheduleWindow = {
  id?: string;
  branch_id?: string | null;
  weekday: number;
  start_min: number;
  end_min: number;
};

export type ProviderDayOff = {
  id?: string;
  date: string;
};
