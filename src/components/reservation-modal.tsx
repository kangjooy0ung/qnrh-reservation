"use client";

import { useActionState, useEffect } from "react";
import { createReservation, cancelReservation } from "@/app/actions/reservation-actions";
import { initialActionState } from "@/lib/action-state";
import type { TimetableDay, TimetableReservation, TimetableSlot } from "@/components/weekly-timetable";

export function ReservationModal({
  facilityId,
  facilityName,
  day,
  slots,
  reservation,
  onClose,
}: {
  facilityId: string;
  facilityName: string;
  day: TimetableDay;
  slots: TimetableSlot[];
  reservation: TimetableReservation | null;
  onClose: () => void;
}) {
  const first = slots[0];
  const last = slots[slots.length - 1];
  const slotLabel =
    slots.length > 1
      ? `${first.label}~${last.label} (총 ${slots.length}개 교시, ${first.start_time}~${last.end_time})`
      : `${first.label} (${first.start_time}~${first.end_time})`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">
              {facilityName} · {day.label}요일 {day.monthDay} · {slotLabel}
            </p>
            <h3 className="mt-1 text-lg font-bold text-slate-900">
              {reservation ? "예약 정보" : "시설 예약하기"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {reservation ? (
          <CancelForm reservation={reservation} onClose={onClose} />
        ) : (
          <CreateForm facilityId={facilityId} day={day} slots={slots} onClose={onClose} />
        )}
      </div>
    </div>
  );
}

function CreateForm({
  facilityId,
  day,
  slots,
  onClose,
}: {
  facilityId: string;
  day: TimetableDay;
  slots: TimetableSlot[];
  onClose: () => void;
}) {
  const [state, formAction, isPending] = useActionState(createReservation, initialActionState);

  useEffect(() => {
    if (state.status === "success") {
      const timer = setTimeout(onClose, 900);
      return () => clearTimeout(timer);
    }
  }, [state.status, onClose]);

  if (state.status === "success") {
    return (
      <div className="py-6 text-center">
        <p className="text-3xl">✅</p>
        <p className="mt-2 font-semibold text-slate-800">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="facility_id" value={facilityId} />
      <input type="hidden" name="reservation_date" value={day.iso} />
      {slots.map((slot) => (
        <input key={slot.id} type="hidden" name="time_slot_id" value={slot.id} />
      ))}

      <Field label="예약자 성함 *">
        <input
          name="teacher_name"
          required
          maxLength={20}
          placeholder="예: 김선생"
          className="input"
        />
      </Field>
      <Field label="학년/부서 (선택)">
        <input name="department" maxLength={30} placeholder="예: 2학년 3반" className="input" />
      </Field>
      <Field label="사용 목적 (선택)">
        <input
          name="purpose"
          maxLength={40}
          placeholder="예: 학급 특별활동"
          className="input"
        />
      </Field>
      <Field label="연락처 (선택)">
        <input name="contact" maxLength={20} placeholder="예: 내선 1234" className="input" />
      </Field>

      {state.status === "error" && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        {isPending
          ? "예약 처리 중..."
          : slots.length > 1
            ? `${slots.length}개 교시 예약 확정하기`
            : "예약 확정하기"}
      </button>
    </form>
  );
}

function CancelForm({
  reservation,
  onClose,
}: {
  reservation: TimetableReservation;
  onClose: () => void;
}) {
  const [state, formAction, isPending] = useActionState(cancelReservation, initialActionState);

  useEffect(() => {
    if (state.status === "success") {
      const timer = setTimeout(onClose, 900);
      return () => clearTimeout(timer);
    }
  }, [state.status, onClose]);

  if (state.status === "success") {
    return (
      <div className="py-6 text-center">
        <p className="text-3xl">🗑️</p>
        <p className="mt-2 font-semibold text-slate-800">{state.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <dl className="space-y-1.5 rounded-xl bg-slate-50 p-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-400">예약자</dt>
          <dd className="font-medium text-slate-800">{reservation.teacher_name}</dd>
        </div>
        {reservation.department && (
          <div className="flex justify-between">
            <dt className="text-slate-400">학년/부서</dt>
            <dd className="font-medium text-slate-800">{reservation.department}</dd>
          </div>
        )}
        {reservation.purpose && (
          <div className="flex justify-between">
            <dt className="text-slate-400">사용 목적</dt>
            <dd className="font-medium text-slate-800">{reservation.purpose}</dd>
          </div>
        )}
      </dl>

      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="id" value={reservation.id} />
        <Field label="예약을 취소하려면 예약자 성함을 다시 입력하세요">
          <input name="teacher_name" required maxLength={20} className="input" />
        </Field>

        {state.status === "error" && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.message}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="mt-1 rounded-xl bg-red-50 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
        >
          {isPending ? "취소 처리 중..." : "예약 취소하기"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
      {label}
      {children}
    </label>
  );
}
