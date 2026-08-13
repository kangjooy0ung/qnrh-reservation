import "server-only";
import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase-server";
import type { Facility } from "@/lib/types";

export async function getFacilities(opts?: { includeInactive?: boolean }): Promise<Facility[]> {
  const supabase = getSupabaseServer();
  let query = supabase.from("facilities").select("*").order("sort_order", { ascending: true });
  if (!opts?.includeInactive) {
    query = query.eq("is_active", true);
  }
  const { data, error } = await query;
  if (error) throw new Error(`시설 목록을 불러오지 못했습니다: ${error.message}`);
  return data as Facility[];
}

// 같은 요청(레이아웃 + 페이지 등) 안에서 여러 번 호출돼도 DB 조회는 한 번만 일어나도록 캐싱합니다.
export const getFacility = cache(async (id: string): Promise<Facility | null> => {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase.from("facilities").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`시설 정보를 불러오지 못했습니다: ${error.message}`);
  return data as Facility | null;
});
