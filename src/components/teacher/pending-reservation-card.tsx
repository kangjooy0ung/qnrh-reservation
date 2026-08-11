"use client";

import { useState } from "react";
import { approveReservation, rejectReservation } from "@/app/actions/teacher-actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import type { ReservationWithRelations } from "@/lib/types";

export function PendingReservationCard({ reservation }: { reservation: ReservationWithRelations }) {
  const [showReject, setShowReject] = useState(false);

  return (
    <li className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{reservation.facility?.icon ?? "🏫"}</span>
            <p className="font-semibold text-slate-900">
              {reservation.facility?.name ?? "삭제된 시설"}
            </p>
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-700">
              승인대기
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {reservation.reservation_date} · {reservation.time_slot?.label ?? "-"} (
            {reservation.time_slot?.start_time.slice(0, 5)}~
            {reservation.time_slot?.end_time.slice(0, 5)})
          </p>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500 sm:grid-cols-4">
            <div>
              <dt className="text-slate-400">예약자</dt>
              <dd className="font-medium text-slate-800">{reservation.teacher_name}</dd>
            </div>
            {reservation.department && (
              <div>
                <dt className="text-slate-400">학년/부서</dt>
                <dd className="font-medium text-slate-800">{reservation.department}</dd>
              </div>
            )}
            {reservation.purpose && (
              <div>
                <dt className="text-slate-400">목적</dt>
                <dd className="font-medium text-slate-800">{reservation.purpose}</dd>
              </div>
            )}
            {reservation.contact && (
              <div>
                <dt className="text-slate-400">연락처</dt>
                <dd className="font-medium text-slate-800">{reservation.contact}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <form action={approveReservation}>
            <input type="hidden" name="id" value={reservation.id} />
            <ConfirmSubmitButton
              message={`${reservation.teacher_name} 선생님의 예약을 승인할까요?`}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              승인
            </ConfirmSubmitButton>
          </form>
          <button
            type="button"
            onClick={() => setShowReject((v) => !v)}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
          >
            반려
          </button>
        </div>
      </div>

      {showReject && (
        <form
          action={rejectReservation}
          className="mt-3 flex flex-wrap items-center gap-2 border-t border-amber-100 pt-3"
        >
          <input type="hidden" name="id" value={reservation.id} />
          <input
            type="text"
            name="reason"
            maxLength={100}
            placeholder="반려 사유 (선택)"
            className="input flex-1"
          />
          <ConfirmSubmitButton
            message={`${reservation.teacher_name} 선생님의 예약을 반려할까요?`}
            className="shrink-0 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
          >
            반려 확정
          </ConfirmSubmitButton>
        </form>
      )}
    </li>
  );
}
