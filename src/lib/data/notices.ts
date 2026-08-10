import "server-only";
import { getSupabaseServer } from "@/lib/supabase-server";
import type { Notice } from "@/lib/types";

export async function getNotices(): Promise<Notice[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(`공지사항을 불러오지 못했습니다: ${error.message}`);
  return data as Notice[];
}

export async function getNotice(id: string): Promise<Notice | null> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase.from("notices").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`공지사항을 불러오지 못했습니다: ${error.message}`);
  return data as Notice | null;
}
