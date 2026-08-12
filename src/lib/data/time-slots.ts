import "server-only";
import { getSupabaseServer } from "@/lib/supabase-server";
import type { Facility, TimeSlot } from "@/lib/types";

// 총관리자가 /admin/settings 에서 관리하는 공용 교시표 (facility_id IS NULL)
export async function getTimeSlots(opts?: { includeInactive?: boolean }): Promise<TimeSlot[]> {
  const supabase = getSupabaseServer();
  let query = supabase
    .from("time_slots")
    .select("*")
    .is("facility_id", null)
    .order("sort_order", { ascending: true });
  if (!opts?.includeInactive) {
    query = query.eq("is_active", true);
  }
  const { data, error } = await query;
  if (error) throw new Error(`교시 정보를 불러오지 못했습니다: ${error.message}`);
  return data as TimeSlot[];
}

// 승인형 시설은 담당 선생님이 직접 관리하는 전용 교시표를, 그 외 시설은 공용 교시표를 사용합니다.
export async function getTimeSlotsForFacility(
  facility: Facility,
  opts?: { includeInactive?: boolean }
): Promise<TimeSlot[]> {
  if (!facility.requires_approval) {
    return getTimeSlots(opts);
  }
  const supabase = getSupabaseServer();
  let query = supabase
    .from("time_slots")
    .select("*")
    .eq("facility_id", facility.id)
    .order("sort_order", { ascending: true });
  if (!opts?.includeInactive) {
    query = query.eq("is_active", true);
  }
  const { data, error } = await query;
  if (error) throw new Error(`교시 정보를 불러오지 못했습니다: ${error.message}`);
  return data as TimeSlot[];
}
