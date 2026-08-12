export type Facility = {
  id: string;
  name: string;
  category: string;
  location: string | null;
  capacity: number | null;
  description: string | null;
  icon: string;
  color: string;
  sort_order: number;
  is_active: boolean;
  requires_approval: boolean;
  created_at: string;
};

export type TimeSlot = {
  id: string;
  label: string;
  start_time: string; // "HH:MM:SS"
  end_time: string;
  sort_order: number;
  is_active: boolean;
  facility_id: string | null;
};

export type ReservationStatus = "pending" | "confirmed" | "cancelled" | "blocked";

export type Reservation = {
  id: string;
  facility_id: string;
  time_slot_id: string;
  reservation_date: string; // "YYYY-MM-DD"
  teacher_name: string;
  department: string | null;
  purpose: string | null;
  contact: string | null;
  request_note: string | null;
  status: ReservationStatus;
  reject_reason: string | null;
  created_at: string;
  cancelled_at: string | null;
};

export type FacilityAdmin = {
  facility_id: string;
  password_hash: string;
  updated_at: string;
};

export type ReservationWithRelations = Reservation & {
  facility: Pick<Facility, "id" | "name" | "icon" | "color" | "location"> | null;
  time_slot: Pick<TimeSlot, "id" | "label" | "start_time" | "end_time"> | null;
};

export type Notice = {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
};
