import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// 이 클라이언트는 Service Role Key를 사용하므로 절대 클라이언트 컴포넌트나
// "use client" 파일에서 import 하지 마세요. Server Component / Server Action 전용입니다.
let client: SupabaseClient | null = null;

export function getSupabaseServer(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되지 않았습니다. .env.local 파일을 확인하세요."
    );
  }

  client = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
  return client;
}
