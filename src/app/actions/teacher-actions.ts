"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase-server";
import {
  checkTeacherPassword,
  computeTeacherToken,
  isValidTeacherToken,
  TEACHER_COOKIE_NAME,
} from "@/lib/teacher-auth";
import type { ActionState } from "@/lib/action-state";

const SESSION_MAX_AGE = 60 * 60 * 12; // 12시간

async function requireTeacher() {
  const store = await cookies();
  const token = store.get(TEACHER_COOKIE_NAME)?.value;
  if (!(await isValidTeacherToken(token))) {
    throw new Error("담당 선생님 인증이 필요합니다.");
  }
}

export async function teacherLogin(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  if (!checkTeacherPassword(password)) {
    return { status: "error", message: "비밀번호가 올바르지 않습니다." };
  }

  const store = await cookies();
  store.set(TEACHER_COOKIE_NAME, await computeTeacherToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  redirect("/teacher");
}

export async function teacherLogout() {
  const store = await cookies();
  store.delete(TEACHER_COOKIE_NAME);
  redirect("/teacher/login");
}

export async function approveReservation(formData: FormData): Promise<void> {
  await requireTeacher();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = getSupabaseServer();
  const { data: reservation } = await supabase
    .from("reservations")
    .select("facility_id, status")
    .eq("id", id)
    .maybeSingle();
  if (!reservation || reservation.status !== "pending") return;

  await supabase.from("reservations").update({ status: "confirmed" }).eq("id", id);

  revalidatePath("/teacher");
  revalidatePath(`/facilities/${reservation.facility_id}`);
  revalidatePath("/reservations");
}

export async function rejectReservation(formData: FormData): Promise<void> {
  await requireTeacher();
  const id = String(formData.get("id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!id) return;

  const supabase = getSupabaseServer();
  const { data: reservation } = await supabase
    .from("reservations")
    .select("facility_id, status")
    .eq("id", id)
    .maybeSingle();
  if (!reservation || reservation.status !== "pending") return;

  await supabase
    .from("reservations")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      reject_reason: reason || null,
    })
    .eq("id", id);

  revalidatePath("/teacher");
  revalidatePath(`/facilities/${reservation.facility_id}`);
  revalidatePath("/reservations");
}
