"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase-server";
import { hashPassword, verifyPassword } from "@/lib/password-hash";
import type { ActionState } from "@/lib/action-state";

const CANCEL_PIN_PATTERN = /^\d{4}$/;

export async function createReservation(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const facilityId = String(formData.get("facility_id") ?? "").trim();
  const timeSlotIds = formData.getAll("time_slot_id").map((v) => String(v).trim()).filter(Boolean);
  const reservationDates = formData.getAll("reservation_date").map((v) => String(v).trim()).filter(Boolean);
  const teacherName = String(formData.get("teacher_name") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  const purpose = String(formData.get("purpose") ?? "").trim();
  const contact = String(formData.get("contact") ?? "").trim();
  const requestNote = String(formData.get("request_note") ?? "").trim();
  const cancelPin = String(formData.get("cancel_pin") ?? "").trim();

  if (
    !facilityId ||
    timeSlotIds.length === 0 ||
    timeSlotIds.length !== reservationDates.length
  ) {
    return { status: "error", message: "예약 정보가 올바르지 않습니다. 다시 시도해 주세요." };
  }
  if (!teacherName) {
    return { status: "error", message: "예약자 성함을 입력해 주세요." };
  }
  if (teacherName.length > 20) {
    return { status: "error", message: "예약자 성함이 너무 깁니다." };
  }
  if (!CANCEL_PIN_PATTERN.test(cancelPin)) {
    return { status: "error", message: "취소 비밀번호는 숫자 4자리로 입력해 주세요." };
  }

  // 과거 날짜 예약 방지
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (reservationDates.some((date) => new Date(`${date}T00:00:00`) < today)) {
    return { status: "error", message: "지난 날짜는 예약할 수 없습니다." };
  }

  const supabase = getSupabaseServer();

  const { data: facility, error: facilityError } = await supabase
    .from("facilities")
    .select("requires_approval")
    .eq("id", facilityId)
    .maybeSingle();
  if (facilityError || !facility) {
    return { status: "error", message: "시설 정보를 찾을 수 없습니다." };
  }
  const requiresApproval = facility.requires_approval;
  const initialStatus = requiresApproval ? "pending" : "confirmed";
  const cancelPinHash = await hashPassword(cancelPin);

  let successCount = 0;
  let duplicateCount = 0;
  let otherErrorMessage: string | null = null;

  for (let i = 0; i < timeSlotIds.length; i += 1) {
    const { error } = await supabase.from("reservations").insert({
      facility_id: facilityId,
      time_slot_id: timeSlotIds[i],
      reservation_date: reservationDates[i],
      teacher_name: teacherName,
      department: department || null,
      purpose: purpose || null,
      contact: contact || null,
      request_note: requiresApproval ? requestNote || null : null,
      cancel_pin_hash: cancelPinHash,
      status: initialStatus,
    });

    if (!error) {
      successCount += 1;
    } else if (error.code === "23505") {
      duplicateCount += 1;
    } else {
      otherErrorMessage = error.message;
    }
  }

  revalidatePath(`/facilities/${facilityId}`);
  revalidatePath("/reservations");

  if (successCount === timeSlotIds.length) {
    const base =
      timeSlotIds.length > 1 ? `${successCount}개 교시 예약` : "예약";
    return {
      status: "success",
      message: requiresApproval
        ? `${base} 신청이 접수되었습니다. 담당 선생님 승인 후 확정됩니다. 취소 시 방금 입력한 비밀번호가 필요하니 잊지 마세요.`
        : `${base}이 완료되었습니다. 취소 시 방금 입력한 비밀번호가 필요하니 잊지 마세요.`,
    };
  }
  if (successCount > 0) {
    return {
      status: "success",
      message: requiresApproval
        ? `${successCount}개 교시 예약 신청이 접수되었습니다(담당 선생님 승인 필요). ${duplicateCount}개 교시는 이미 확정(또는 사용 제한)되어 제외되었습니다.`
        : `${successCount}개 교시 예약 완료, ${duplicateCount}개 교시는 다른 선생님이 먼저 예약해 제외되었습니다.`,
    };
  }
  if (duplicateCount > 0) {
    return {
      status: "error",
      message: "선택한 교시가 이미 확정(또는 사용 제한)되어 있습니다. 목록을 새로고침한 뒤 다시 시도해 주세요.",
    };
  }
  return { status: "error", message: `예약에 실패했습니다: ${otherErrorMessage ?? "알 수 없는 오류"}` };
}

export async function cancelReservation(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "").trim();
  const cancelPin = String(formData.get("cancel_pin") ?? "").trim();

  if (!id || !CANCEL_PIN_PATTERN.test(cancelPin)) {
    return { status: "error", message: "취소 비밀번호(숫자 4자리)를 입력해 주세요." };
  }

  const supabase = getSupabaseServer();
  const { data: reservation, error: fetchError } = await supabase
    .from("reservations")
    .select("id, facility_id, status, cancel_pin_hash")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !reservation) {
    return { status: "error", message: "예약 내역을 찾을 수 없습니다." };
  }
  if (reservation.status === "cancelled") {
    return { status: "error", message: "이미 취소된 예약입니다." };
  }
  if (!reservation.cancel_pin_hash) {
    return {
      status: "error",
      message: "취소 비밀번호가 설정되지 않은 예약입니다. 담당 선생님에게 문의해 주세요.",
    };
  }
  if (!(await verifyPassword(cancelPin, reservation.cancel_pin_hash))) {
    return { status: "error", message: "취소 비밀번호가 올바르지 않습니다." };
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
