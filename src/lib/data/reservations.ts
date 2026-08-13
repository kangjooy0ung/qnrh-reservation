import "server-only";
import { getSupabaseServer } from "@/lib/supabase-server";
import { getSemesterRange } from "@/lib/dates";
import type { ReservationWithRelations } from "@/lib/types";

const RELATION_SELECT =
  "*, facility:facilities(id,name,icon,color,location), time_slot:time_slots(id,label,start_time,end_time)";

// 확정/대기/차단 예약에 더해, 담당 선생님이 사유를 남기고 반려/취소한 예약도 함께 가져옵니다.
// (그 자리가 다시 예약 가능해져도 반려 사유를 시간표에 안내하기 위함. 사유 없는 단순 자진 취소는 제외)
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
    .gte("reservation_date", startDate)
    .lte("reservation_date", endDate)
    .or(
      "status.in.(confirmed,pending,blocked),and(status.eq.cancelled,reject_reason.not.is.null,reject_reason_public.eq.true)"
    );
  if (error) throw new Error(`예약 정보를 불러오지 못했습니다: ${error.message}`);
  return data as unknown as ReservationWithRelations[];
}

export async function getPendingReservationsForFacility(
  facilityId: string
): Promise<ReservationWithRelations[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("reservations")
    .select(RELATION_SELECT)
    .eq("facility_id", facilityId)
    .eq("status", "pending")
    .order("reservation_date", { ascending: true });
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
  status?: "confirmed" | "pending" | "cancelled" | "blocked" | "all";
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

// 사유를 남기고 반려/취소된 예약 최근 내역 (공개 여부와 무관하게 전부, 담당 선생님 전용 화면용)
export async function getRecentRejectionsForFacility(
  facilityId: string,
  limit = 30
): Promise<ReservationWithRelations[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("reservations")
    .select(RELATION_SELECT)
    .eq("facility_id", facilityId)
    .eq("status", "cancelled")
    .not("reject_reason", "is", null)
    .order("cancelled_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`반려 내역을 불러오지 못했습니다: ${error.message}`);
  return data as unknown as ReservationWithRelations[];
}

export type FacilityStatusCounts = { pending: number; confirmed: number; blocked: number };

export async function getFacilityStatusCounts(facilityId: string): Promise<FacilityStatusCounts> {
  const supabase = getSupabaseServer();
  const [pending, confirmed, blocked] = await Promise.all([
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("facility_id", facilityId)
      .eq("status", "pending"),
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("facility_id", facilityId)
      .eq("status", "confirmed"),
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("facility_id", facilityId)
      .eq("status", "blocked"),
  ]);
  return {
    pending: pending.count ?? 0,
    confirmed: confirmed.count ?? 0,
    blocked: blocked.count ?? 0,
  };
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

function slotMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

export type FacilityUsageStats = {
  semesterLabel: string;
  semesterMinutes: number;
  monthly: { month: string; minutes: number }[];
};

// 확정된 예약 기준으로 이번 학기 누적 대여시간을 월별로 집계합니다.
export async function getFacilityUsageStats(facilityId: string): Promise<FacilityUsageStats> {
  const { label, start, end } = getSemesterRange();
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("reservations")
    .select("reservation_date, time_slot:time_slots(start_time,end_time)")
    .eq("facility_id", facilityId)
    .eq("status", "confirmed")
    .gte("reservation_date", start)
    .lte("reservation_date", end);
  if (error) throw new Error(`누적 대여시간을 불러오지 못했습니다: ${error.message}`);

  const monthlyMap = new Map<string, number>();
  let semesterMinutes = 0;
  for (const row of (data ?? []) as unknown as {
    reservation_date: string;
    time_slot: { start_time: string; end_time: string } | null;
  }[]) {
    if (!row.time_slot) continue;
    const minutes = slotMinutes(row.time_slot.start_time, row.time_slot.end_time);
    if (minutes <= 0) continue;
    const month = row.reservation_date.slice(0, 7);
    monthlyMap.set(month, (monthlyMap.get(month) ?? 0) + minutes);
    semesterMinutes += minutes;
  }

  const monthly = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, minutes]) => ({ month, minutes }));

  return { semesterLabel: label, semesterMinutes, monthly };
}
