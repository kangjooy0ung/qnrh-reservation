"use client";

import { useState } from "react";
import { approveReservation, rejectReservation } from "@/app/actions/teacher-actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import type { ReservationWithRelations } from "@/lib/types";

export function PendingApplicantGroup({
  facilityId,
  reservationDate,
  timeSlotLabel,
  timeSlotRange,
  applicants,
  selectedIds,
  onToggle,
}: {
  facilityId: string;
  reservationDate: string;
  timeSlotLabel: string;
  timeSlotRange: string;
  applicants: ReservationWithRelations[];
  selectedIds?: Set<string>;
  onToggle?: (id: string) => void;
}) {
  return (
    <li className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
      <div className="flex items-center gap-2">
        <p className="font-semibold text-slate-900">
          {reservationDate} · {timeSlotLabel}
        </p>
        <span className="text-xs text-slate-400">{timeSlotRange}</span>
        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-700">
          신청 {applicants.length}건 · 1건만 승인 가능
        </span>
      </div>

      <ul className="mt-3 flex flex-col gap-2">
        {applicants.map((r) => (
          <ApplicantRow
            key={r.id}
            facilityId={facilityId}
            reservation={r}
            selected={selectedIds?.has(r.id) ?? false}
            onToggle={onToggle}
          />
        ))}
      </ul>
    </li>
  );
}

function ApplicantRow({
  facilityId,
  reservation,
  selected,
  onToggle,
}: {
  facilityId: string;
  reservation: ReservationWithRelations;
  selected: boolean;
  onToggle?: (id: string) => void;
}) {
  const [showReject, setShowReject] = useState(false);

  return (
    <li className="rounded-xl border border-amber-100 bg-white p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        {onToggle && (
          <label className="flex shrink-0 items-center pt-0.5">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggle(reservation.id)}
              className="h-3.5 w-3.5"
              aria-label={`${reservation.teacher_name} 선생님 신청 선택`}
            />
          </label>
        )}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500 sm:grid-cols-4">
          <div>
            <dt className="text-slate-400">신청자</dt>
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
          {reservation.request_note && (
            <div className="col-span-2 sm:col-span-4">
              <dt className="text-slate-400">요청사항 메모</dt>
              <dd className="font-medium text-slate-800">{reservation.request_note}</dd>
            </div>
          )}
        </dl>

        <div className="flex shrink-0 items-center gap-2">
          <form action={approveReservation}>
            <input type="hidden" name="facility_id" value={facilityId} />
            <input type="hidden" name="id" value={reservation.id} />
            <ConfirmSubmitButton
              message={`${reservation.teacher_name} 선생님의 신청을 승인할까요? 같은 시간대의 다른 신청은 자동 반려됩니다.`}
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
          <input type="hidden" name="facility_id" value={facilityId} />
          <input type="hidden" name="id" value={reservation.id} />
          <input
            type="text"
            name="reason"
            maxLength={100}
            placeholder="반려 사유 (선택)"
            className="input flex-1"
          />
          <label className="flex shrink-0 items-center gap-1.5 text-xs text-slate-500">
            <input type="checkbox" name="reason_public" defaultChecked className="h-3.5 w-3.5" />
            사유를 예약 페이지에 공개
          </label>
          <ConfirmSubmitButton
            message={`${reservation.teacher_name} 선생님의 신청을 반려할까요?`}
            className="shrink-0 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
          >
            반려 확정
          </ConfirmSubmitButton>
        </form>
      )}
    </li>
  );
}
