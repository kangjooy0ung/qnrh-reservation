"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase-server";
import { checkAdminPassword, computeAdminToken, isValidAdminToken } from "@/lib/admin-auth";
import { ADMIN_COOKIE_NAME } from "@/lib/constants";
import type { ActionState } from "@/lib/action-state";

const SESSION_MAX_AGE = 60 * 60 * 12; // 12시간

async function requireAdmin() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE_NAME)?.value;
  if (!(await isValidAdminToken(token))) {
    throw new Error("관리자 인증이 필요합니다.");
  }
}

export async function adminLogin(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  if (!checkAdminPassword(password)) {
    return { status: "error", message: "비밀번호가 올바르지 않습니다." };
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE_NAME, await computeAdminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  redirect("/admin");
}

export async function adminLogout() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE_NAME);
  redirect("/admin/login");
}

// ---------- 시설 관리 ----------

export async function upsertFacility(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "기타").trim();
  const location = String(formData.get("location") ?? "").trim();
  const capacityRaw = String(formData.get("capacity") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const icon = String(formData.get("icon") ?? "🏫").trim() || "🏫";
  const color = String(formData.get("color") ?? "#059669").trim();
  const sortOrderRaw = String(formData.get("sort_order") ?? "0").trim();
  const isActive = formData.get("is_active") === "on";

  if (!name) {
    return { status: "error", message: "시설명을 입력해 주세요." };
  }

  const payload = {
    name,
    category,
    location: location || null,
    capacity: capacityRaw ? Number(capacityRaw) : null,
    description: description || null,
    icon,
    color,
    sort_order: sortOrderRaw ? Number(sortOrderRaw) : 0,
    is_active: isActive,
  };

  const supabase = getSupabaseServer();
  const { error } = id
    ? await supabase.from("facilities").update(payload).eq("id", id)
    : await supabase.from("facilities").insert(payload);

  if (error) {
    return { status: "error", message: `저장에 실패했습니다: ${error.message}` };
  }

  revalidatePath("/admin/facilities");
  revalidatePath("/facilities");
  redirect("/admin/facilities");
}

export async function deleteFacility(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = getSupabaseServer();
  await supabase.from("facilities").delete().eq("id", id);
  revalidatePath("/admin/facilities");
  revalidatePath("/facilities");
}

export async function deleteFacilities(ids: string[]): Promise<void> {
  await requireAdmin();
  if (ids.length === 0) return;
  const supabase = getSupabaseServer();
  await supabase.from("facilities").delete().in("id", ids);
  revalidatePath("/admin/facilities");
  revalidatePath("/facilities");
}

// ---------- 공지사항 관리 ----------

export async function upsertNotice(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const isPinned = formData.get("is_pinned") === "on";

  if (!title || !content) {
    return { status: "error", message: "제목과 내용을 모두 입력해 주세요." };
  }

  const payload = { title, content, is_pinned: isPinned };
  const supabase = getSupabaseServer();
  const { error } = id
    ? await supabase.from("notices").update(payload).eq("id", id)
    : await supabase.from("notices").insert(payload);

  if (error) {
    return { status: "error", message: `저장에 실패했습니다: ${error.message}` };
  }

  revalidatePath("/admin/notices");
  revalidatePath("/notices");
  redirect("/admin/notices");
}

export async function deleteNotice(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = getSupabaseServer();
  await supabase.from("notices").delete().eq("id", id);
  revalidatePath("/admin/notices");
  revalidatePath("/notices");
}

export async function deleteNotices(ids: string[]): Promise<void> {
  await requireAdmin();
  if (ids.length === 0) return;
  const supabase = getSupabaseServer();
  await supabase.from("notices").delete().in("id", ids);
  revalidatePath("/admin/notices");
  revalidatePath("/notices");
}

// ---------- 교시(시간표) 관리 ----------

export async function upsertTimeSlot(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  const startTime = String(formData.get("start_time") ?? "").trim();
  const endTime = String(formData.get("end_time") ?? "").trim();
  const sortOrderRaw = String(formData.get("sort_order") ?? "0").trim();
  const isActive = formData.get("is_active") === "on";

  if (!label || !startTime || !endTime) {
    return { status: "error", message: "교시명과 시작/종료 시간을 입력해 주세요." };
  }

  const payload = {
    label,
    start_time: startTime,
    end_time: endTime,
    sort_order: sortOrderRaw ? Number(sortOrderRaw) : 0,
    is_active: isActive,
  };

  const supabase = getSupabaseServer();
  const { error } = id
    ? await supabase.from("time_slots").update(payload).eq("id", id)
    : await supabase.from("time_slots").insert(payload);

  if (error) {
    return { status: "error", message: `저장에 실패했습니다: ${error.message}` };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/facilities", "layout");
  redirect("/admin/settings");
}

export async function deleteTimeSlot(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = getSupabaseServer();
  await supabase.from("time_slots").delete().eq("id", id);
  revalidatePath("/admin/settings");
}

// ---------- 운영 설정 ----------

export async function updateSetting(formData: FormData): Promise<void> {
  await requireAdmin();
  const key = String(formData.get("key") ?? "");
  const value = String(formData.get("value") ?? "");
  if (!key) return;
  const supabase = getSupabaseServer();
  await supabase.from("app_settings").upsert({ key, value });
  revalidatePath("/admin/settings");
}

// ---------- 예약 관리(관리자) ----------

export async function adminCancelReservation(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = getSupabaseServer();
  const { data: reservation } = await supabase
    .from("reservations")
    .select("facility_id")
    .eq("id", id)
    .maybeSingle();
  await supabase
    .from("reservations")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/reservations");
  if (reservation?.facility_id) {
    revalidatePath(`/facilities/${reservation.facility_id}`);
  }
  revalidatePath("/reservations");
}

export async function adminBulkCancelReservations(ids: string[]): Promise<void> {
  await requireAdmin();
  if (ids.length === 0) return;
  const supabase = getSupabaseServer();
  const { data: rows } = await supabase
    .from("reservations")
    .select("facility_id")
    .in("id", ids);
  await supabase
    .from("reservations")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .in("id", ids);
  revalidatePath("/admin/reservations");
  revalidatePath("/reservations");
  const facilityIds = new Set((rows ?? []).map((r) => r.facility_id).filter(Boolean));
  for (const facilityId of facilityIds) {
    revalidatePath(`/facilities/${facilityId}`);
  }
}
