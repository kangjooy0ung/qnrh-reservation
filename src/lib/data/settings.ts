import "server-only";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function getSetting(key: string, fallback = ""): Promise<string> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error) throw new Error(`설정을 불러오지 못했습니다: ${error.message}`);
  return data?.value ?? fallback;
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase.from("app_settings").select("key, value");
  if (error) throw new Error(`설정을 불러오지 못했습니다: ${error.message}`);
  return Object.fromEntries((data ?? []).map((row) => [row.key, row.value]));
}
