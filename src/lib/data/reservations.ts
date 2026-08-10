import "server-only";
import { getSupabaseServer } from "@/lib/supabase-server";
import type { ReservationWithRelations } from "@/lib/types";

const RELATION_SELECT =
  "*, facility:facilities(id,name,icon,color,location), time_slot:time_slots(id,label,start_time,end_time)";

export async function getReservationsForFacilityInRange(
  facilityId: string,
  startDate: string,
  endDate: string
): Promise<ReservationWithRelations[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("reservations")
    .select(RELATION_SELECT)
    .eq("facility_id", facilityId)
    .eq("status", "confirmed")
    .gte("reservation_date", startDate)
    .lte("reservation_date", endDate);
  if (error) throw new Error(`예약 정보를 불러오지 못했습니다: ${error.message}`);
  return data as unknown as ReservationWithRelations[];
}

export async function getReservationsByTeacherName(
  name: string
): Promise<ReservationWithRelations[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("reservations")
    .select(RELATION_SELECT)
    .ilike("teacher_name", name.trim())
    .order("reservation_date", { ascending: false });
  if (error) throw new Error(`예약 정보를 불러오지 못했습니다: ${error.message}`);
  return data as unknown as ReservationWithRelations[];
}

export type ReservationFilter = {
  facilityId?: string;
  status?: "confirmed" | "cancelled" | "all";
  from?: string;
  to?: string;
};

export async function getAllReservations(
  filter: ReservationFilter = {}
): Promise<ReservationWithRelations[]> {
  const supabase = getSupabaseServer();
  let query = supabase
    .from("reservations")
    .select(RELATION_SELECT)
    .order("reservation_date", { ascending: false })
    .limit(500);

  if (filter.facilityId) query = query.eq("facility_id", filter.facilityId);
  if (!filter.status || filter.status !== "all") {
    query = query.eq("status", filter.status ?? "confirmed");
  }
  if (filter.from) query = query.gte("reservation_date", filter.from);
  if (filter.to) query = query.lte("reservation_date", filter.to);

  const { data, error } = await query;
  if (error) throw new Error(`예약 정보를 불러오지 못했습니다: ${error.message}`);
  return data as unknown as ReservationWithRelations[];
}

export async function getTodayReservationCount(today: string): Promise<number> {
  const supabase = getSupabaseServer();
  const { count, error } = await supabase
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("status", "confirmed")
    .eq("reservation_date", today);
  if (error) throw new Error(`예약 정보를 불러오지 못했습니다: ${error.message}`);
  return count ?? 0;
}
