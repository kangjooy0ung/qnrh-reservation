import "server-only";
import { getSupabaseServer } from "@/lib/supabase-server";
import type { FacilityAdmin } from "@/lib/types";

export async function getFacilityAdmin(facilityId: string): Promise<FacilityAdmin | null> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("facility_admins")
    .select("*")
    .eq("facility_id", facilityId)
    .maybeSingle();
  if (error) throw new Error(`담당 선생님 로그인 정보를 불러오지 못했습니다: ${error.message}`);
  return data as FacilityAdmin | null;
}

export async function getFacilitiesWithLogin(): Promise<
  { id: string; name: string; icon: string }[]
> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("facility_admins")
    .select("facility_id, facility:facilities(id,name,icon,is_active)")
    .order("facility_id");
  if (error) throw new Error(`시설 목록을 불러오지 못했습니다: ${error.message}`);
  return (data ?? [])
    .map((row) => row.facility as unknown as { id: string; name: string; icon: string; is_active: boolean } | null)
    .filter((f): f is { id: string; name: string; icon: string; is_active: boolean } => !!f && f.is_active)
    .map((f) => ({ id: f.id, name: f.name, icon: f.icon }))
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));
}
