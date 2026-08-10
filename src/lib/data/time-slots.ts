import "server-only";
import { getSupabaseServer } from "@/lib/supabase-server";
import type { TimeSlot } from "@/lib/types";

export async function getTimeSlots(opts?: { includeInactive?: boolean }): Promise<TimeSlot[]> {
  const supabase = getSupabaseServer();
  let query = supabase.from("time_slots").select("*").order("sort_order", { ascending: true });
  if (!opts?.includeInactive) {
    query = query.eq("is_active", true);
  }
  const { data, error } = await query;
  if (error) throw new Error(`교시 정보를 불러오지 못했습니다: ${error.message}`);
  return data as TimeSlot[];
}
