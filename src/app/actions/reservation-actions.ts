"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase-server";
import type { ActionState } from "@/lib/action-state";

export async function createReservation(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const facilityId = String(formData.get("facility_id") ?? "").trim();
  const timeSlotId = String(formData.get("time_slot_id") ?? "").trim();
  const reservationDate = String(formData.get("reservation_date") ?? "").trim();
  const teacherName = String(formData.get("teacher_name") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  const purpose = String(formData.get("purpose") ?? "").trim();
  const contact = String(formData.get("contact") ?? "").trim();

  if (!facilityId || !timeSlotId || !reservationDate) {
    return { status: "error", message: "예약 정보가 올바르지 않습니다. 다시 시도해 주세요." };
  }
  if (!teacherName) {
    return { status: "error", message: "예약자 성함을 입력해 주세요." };
  }
  if (teacherName.length > 20) {
    return { status: "error", message: "예약자 성함이 너무 깁니다." };
  }

  // 과거 날짜 예약 방지
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(`${reservationDate}T00:00:00`);
  if (targetDate < today) {
    return { status: "error", message: "지난 날짜는 예약할 수 없습니다." };
  }

  const supabase = getSupabaseServer();
  const { error } = await supabase.from("reservations").insert({
    facility_id: facilityId,
    time_slot_id: timeSlotId,
    reservation_date: reservationDate,
    teacher_name: teacherName,
    department: department || null,
    purpose: purpose || null,
    contact: contact || null,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        status: "error",
        message: "다른 선생님이 방금 먼저 예약했어요. 목록을 새로고침한 뒤 다시 시도해 주세요.",
      };
    }
    return { status: "error", message: `예약에 실패했습니다: ${error.message}` };
  }

  revalidatePath(`/facilities/${facilityId}`);
  revalidatePath("/reservations");
  return { status: "success", message: "예약이 완료되었습니다." };
}

export async function cancelReservation(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "").trim();
  const teacherName = String(formData.get("teacher_name") ?? "").trim();

  if (!id || !teacherName) {
    return { status: "error", message: "예약자 성함을 입력해 취소해 주세요." };
  }

  const supabase = getSupabaseServer();
  const { data: reservation, error: fetchError } = await supabase
    .from("reservations")
    .select("id, teacher_name, facility_id, status")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !reservation) {
    return { status: "error", message: "예약 내역을 찾을 수 없습니다." };
  }
  if (reservation.status === "cancelled") {
    return { status: "error", message: "이미 취소된 예약입니다." };
  }
  if (reservation.teacher_name.trim() !== teacherName) {
    return { status: "error", message: "예약자 성함이 일치하지 않아 취소할 수 없습니다." };
  }

  const { error } = await supabase
    .from("reservations")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { status: "error", message: `취소에 실패했습니다: ${error.message}` };
  }

  revalidatePath(`/facilities/${reservation.facility_id}`);
  revalidatePath("/reservations");
  return { status: "success", message: "예약이 취소되었습니다." };
}
