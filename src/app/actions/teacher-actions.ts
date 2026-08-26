"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase-server";
import {
  computeFacilitySessionCookieValue,
  hashPassword,
  isValidFacilitySessionToken,
  parseFacilitySessionCookie,
  verifyPassword,
  TEACHER_COOKIE_NAME,
} from "@/lib/facility-admin-auth";
import type { ActionState } from "@/lib/action-state";

const SESSION_MAX_AGE = 60 * 60 * 12; // 12시간

async function requireFacilityAdmin(facilityId: string) {
  const store = await cookies();
  const parsed = parseFacilitySessionCookie(store.get(TEACHER_COOKIE_NAME)?.value);
  if (
    !parsed ||
    parsed.facilityId !== facilityId ||
    !(await isValidFacilitySessionToken(parsed.token, facilityId))
  ) {
    throw new Error("담당 선생님 인증이 필요합니다.");
  }
}

function revalidateFacility(facilityId: string) {
  revalidatePath(`/teacher/${facilityId}`);
  revalidatePath(`/facilities/${facilityId}`);
  revalidatePath(`/facilities/${facilityId}/calendar`);
  revalidatePath("/reservations");
}

export async function teacherLogin(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const facilityId = String(formData.get("facility_id") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!facilityId) {
    return { status: "error", message: "시설을 선택해 주세요." };
  }

  const supabase = getSupabaseServer();
  const { data: admin } = await supabase
    .from("facility_admins")
    .select("password_hash")
    .eq("facility_id", facilityId)
    .maybeSingle();

  if (!admin || !(await verifyPassword(password, admin.password_hash))) {
    return { status: "error", message: "비밀번호가 올바르지 않습니다." };
  }

  const store = await cookies();
  store.set(TEACHER_COOKIE_NAME, await computeFacilitySessionCookieValue(facilityId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  redirect(`/teacher/${facilityId}`);
}

export async function teacherLogout() {
  const store = await cookies();
  store.delete(TEACHER_COOKIE_NAME);
  redirect("/teacher/login");
}

export async function changeFacilityPassword(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const facilityId = String(formData.get("facility_id") ?? "").trim();
  const newPassword = String(formData.get("new_password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  await requireFacilityAdmin(facilityId);

  if (newPassword.length < 4) {
    return { status: "error", message: "비밀번호는 4자 이상으로 입력해 주세요." };
  }
  if (newPassword !== confirmPassword) {
    return { status: "error", message: "새 비밀번호가 일치하지 않습니다." };
  }

  const supabase = getSupabaseServer();
  const { error } = await supabase
    .from("facility_admins")
    .update({ password_hash: await hashPassword(newPassword), updated_at: new Date().toISOString() })
    .eq("facility_id", facilityId);

  if (error) {
    return { status: "error", message: `비밀번호 변경에 실패했습니다: ${error.message}` };
  }

  return { status: "success", message: "비밀번호가 변경되었습니다." };
}

async function approveOne(
  supabase: ReturnType<typeof getSupabaseServer>,
  facilityId: string,
  id: string
): Promise<boolean> {
  const { data: reservation } = await supabase
    .from("reservations")
    .select("facility_id, reservation_date, time_slot_id, status")
    .eq("id", id)
    .maybeSingle();
  if (!reservation || reservation.facility_id !== facilityId || reservation.status !== "pending") {
    return false;
  }

  await supabase.from("reservations").update({ status: "confirmed" }).eq("id", id);

  // 같은 슬롯에 남아있는 다른 신청 건은 자동 반려 처리합니다.
  await supabase
    .from("reservations")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      reject_reason: "다른 신청 건이 먼저 승인되어 자동 반려되었습니다.",
    })
    .eq("facility_id", facilityId)
    .eq("reservation_date", reservation.reservation_date)
    .eq("time_slot_id", reservation.time_slot_id)
    .eq("status", "pending")
    .neq("id", id);

  return true;
}

export async function approveReservation(formData: FormData): Promise<void> {
  const facilityId = String(formData.get("facility_id") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!facilityId || !id) return;
  await requireFacilityAdmin(facilityId);

  const supabase = getSupabaseServer();
  await approveOne(supabase, facilityId, id);

  revalidateFacility(facilityId);
}

export async function bulkApproveReservations(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const facilityId = String(formData.get("facility_id") ?? "").trim();
  const ids = formData.getAll("id").map((v) => String(v).trim()).filter(Boolean);
  if (!facilityId) {
    return { status: "error", message: "시설 정보가 올바르지 않습니다." };
  }
  await requireFacilityAdmin(facilityId);

  if (ids.length === 0) {
    return { status: "error", message: "승인할 신청을 선택해 주세요." };
  }

  const supabase = getSupabaseServer();
  let approvedCount = 0;
  for (const id of ids) {
    if (await approveOne(supabase, facilityId, id)) approvedCount += 1;
  }

  revalidateFacility(facilityId);

  const skippedCount = ids.length - approvedCount;
  if (approvedCount === 0) {
    return {
      status: "error",
      message: "승인할 수 있는 신청이 없습니다. 이미 처리되었을 수 있으니 목록을 새로고침해 주세요.",
    };
  }
  return {
    status: "success",
    message:
      skippedCount > 0
        ? `${approvedCount}건을 승인했습니다. ${skippedCount}건은 이미 처리되어 제외되었습니다.`
        : `${approvedCount}건을 승인했습니다.`,
  };
}

export async function rejectReservation(formData: FormData): Promise<void> {
  const facilityId = String(formData.get("facility_id") ?? "");
  const id = String(formData.get("id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  const isPublic = formData.get("reason_public") === "on";
  if (!facilityId || !id) return;
  await requireFacilityAdmin(facilityId);

  const supabase = getSupabaseServer();
  const { data: reservation } = await supabase
    .from("reservations")
    .select("facility_id, status")
    .eq("id", id)
    .maybeSingle();
  if (!reservation || reservation.facility_id !== facilityId || reservation.status !== "pending") {
    return;
  }

  await supabase
    .from("reservations")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      reject_reason: reason || null,
      reject_reason_public: isPublic,
    })
    .eq("id", id);

  revalidateFacility(facilityId);
}

export async function facilityCancelReservation(formData: FormData): Promise<void> {
  const facilityId = String(formData.get("facility_id") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!facilityId || !id) return;
  await requireFacilityAdmin(facilityId);

  const supabase = getSupabaseServer();
  const { data: reservation } = await supabase
    .from("reservations")
    .select("facility_id, status")
    .eq("id", id)
    .maybeSingle();
  if (!reservation || reservation.facility_id !== facilityId) return;
  if (reservation.status !== "confirmed" && reservation.status !== "pending" && reservation.status !== "blocked") {
    return;
  }

  await supabase
    .from("reservations")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("id", id);

  revalidateFacility(facilityId);
}

export async function blockTimeSlot(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const facilityId = String(formData.get("facility_id") ?? "").trim();
  const reservationDate = String(formData.get("reservation_date") ?? "").trim();
  const timeSlotIds = formData.getAll("time_slot_id").map((v) => String(v).trim()).filter(Boolean);
  const reason = String(formData.get("reason") ?? "").trim();

  await requireFacilityAdmin(facilityId);

  if (!reservationDate || timeSlotIds.length === 0) {
    return { status: "error", message: "날짜와 교시를 선택해 주세요." };
  }

  const supabase = getSupabaseServer();
  let successCount = 0;
  let duplicateCount = 0;

  for (const timeSlotId of timeSlotIds) {
    const { error } = await supabase.from("reservations").insert({
      facility_id: facilityId,
      time_slot_id: timeSlotId,
      reservation_date: reservationDate,
      teacher_name: "사용 제한",
      purpose: reason || null,
      status: "blocked",
    });
    if (!error) successCount += 1;
    else if (error.code === "23505") duplicateCount += 1;
  }

  revalidateFacility(facilityId);

  if (successCount === 0) {
    return { status: "error", message: "이미 예약되었거나 사용 제한된 시간입니다." };
  }
  return {
    status: "success",
    message:
      duplicateCount > 0
        ? `${successCount}개 교시를 사용 제한했습니다. ${duplicateCount}개 교시는 이미 예약/제한되어 제외되었습니다.`
        : `${successCount}개 교시를 사용 제한했습니다.`,
  };
}

export async function unblockReservation(formData: FormData): Promise<void> {
  const facilityId = String(formData.get("facility_id") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!facilityId || !id) return;
  await requireFacilityAdmin(facilityId);

  const supabase = getSupabaseServer();
  const { data: reservation } = await supabase
    .from("reservations")
    .select("facility_id, status")
    .eq("id", id)
    .maybeSingle();
  if (!reservation || reservation.facility_id !== facilityId || reservation.status !== "blocked") return;

  await supabase
    .from("reservations")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("id", id);

  revalidateFacility(facilityId);
}

// ---------- 시설 전용 교시 관리 (승인형 시설의 담당 선생님) ----------

export async function upsertFacilityTimeSlot(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const facilityId = String(formData.get("facility_id") ?? "").trim();
  await requireFacilityAdmin(facilityId);

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
    facility_id: facilityId,
  };

  const supabase = getSupabaseServer();
  const { error } = id
    ? await supabase.from("time_slots").update(payload).eq("id", id).eq("facility_id", facilityId)
    : await supabase.from("time_slots").insert(payload);

  if (error) {
    return { status: "error", message: `저장에 실패했습니다: ${error.message}` };
  }

  revalidatePath(`/teacher/${facilityId}`);
  revalidatePath(`/facilities/${facilityId}`);
  revalidatePath(`/facilities/${facilityId}/calendar`);
  return { status: "success", message: "저장되었습니다." };
}

export async function deleteFacilityTimeSlot(formData: FormData): Promise<void> {
  const facilityId = String(formData.get("facility_id") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!facilityId || !id) return;
  await requireFacilityAdmin(facilityId);

  const supabase = getSupabaseServer();
  await supabase.from("time_slots").delete().eq("id", id).eq("facility_id", facilityId);

  revalidatePath(`/teacher/${facilityId}`);
  revalidatePath(`/facilities/${facilityId}`);
}

// ---------- 시설 공지 메모 ----------

export async function updateFacilityNotice(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const facilityId = String(formData.get("facility_id") ?? "").trim();
  await requireFacilityAdmin(facilityId);

  const notice = String(formData.get("notice") ?? "").trim();
  if (notice.length > 300) {
    return { status: "error", message: "공지 메모는 300자 이내로 입력해 주세요." };
  }

  const supabase = getSupabaseServer();
  const { error } = await supabase
    .from("facilities")
    .update({ teacher_notice: notice || null })
    .eq("id", facilityId);

  if (error) {
    return { status: "error", message: `저장에 실패했습니다: ${error.message}` };
  }

  revalidatePath(`/teacher/${facilityId}`);
  revalidatePath(`/facilities/${facilityId}`);
  revalidatePath(`/facilities/${facilityId}/calendar`);
  return { status: "success", message: "공지 메모가 저장되었습니다." };
}

// ---------- 반려 사유 공개 여부 ----------

export async function setRejectReasonVisibility(formData: FormData): Promise<void> {
  const facilityId = String(formData.get("facility_id") ?? "");
  const id = String(formData.get("id") ?? "");
  const isPublic = formData.get("public") === "true";
  if (!facilityId || !id) return;
  await requireFacilityAdmin(facilityId);

  const supabase = getSupabaseServer();
  const { data: reservation } = await supabase
    .from("reservations")
    .select("facility_id")
    .eq("id", id)
    .maybeSingle();
  if (!reservation || reservation.facility_id !== facilityId) return;

  await supabase.from("reservations").update({ reject_reason_public: isPublic }).eq("id", id);

  revalidatePath(`/teacher/${facilityId}/rejections`);
  revalidatePath(`/facilities/${facilityId}`);
  revalidatePath(`/facilities/${facilityId}/calendar`);
}

export async function deleteRejection(formData: FormData): Promise<void> {
  const facilityId = String(formData.get("facility_id") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!facilityId || !id) return;
  await requireFacilityAdmin(facilityId);

  const supabase = getSupabaseServer();
  const { data: reservation } = await supabase
    .from("reservations")
    .select("facility_id, status, reject_reason")
    .eq("id", id)
    .maybeSingle();
  if (
    !reservation ||
    reservation.facility_id !== facilityId ||
    reservation.status !== "cancelled" ||
    !reservation.reject_reason
  ) {
    return;
  }

  await supabase.from("reservations").delete().eq("id", id);

  revalidatePath(`/teacher/${facilityId}/rejections`);
  revalidatePath(`/facilities/${facilityId}`);
  revalidatePath(`/facilities/${facilityId}/calendar`);
}
