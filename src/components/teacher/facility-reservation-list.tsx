"use client";

import { facilityCancelReservation } from "@/app/actions/teacher-actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import type { ReservationWithRelations } from "@/lib/types";

export function FacilityReservationList({
  facilityId,
  reservations,
}: {
  facilityId: string;
  reservations: ReservationWithRelations[];
}) {
  if (reservations.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
        확정된 예약이 없습니다.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
            <th className="px-4 py-3 font-medium">날짜</th>
            <th className="px-4 py-3 font-medium">교시</th>
            <th className="px-4 py-3 font-medium">예약자</th>
            <th className="px-4 py-3 font-medium">학년/부서</th>
            <th className="px-4 py-3 font-medium">목적</th>
            <th className="px-4 py-3 font-medium text-right">관리</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr key={r.id} className="border-b border-slate-50 last:border-0">
              <td className="px-4 py-3 text-slate-700">{r.reservation_date}</td>
              <td className="px-4 py-3 text-slate-500">{r.time_slot?.label ?? "-"}</td>
              <td className="px-4 py-3 font-medium text-slate-900">{r.teacher_name}</td>
              <td className="px-4 py-3 text-slate-500">{r.department ?? "-"}</td>
              <td className="px-4 py-3 text-slate-500">{r.purpose ?? "-"}</td>
              <td className="px-4 py-3 text-right">
                <form action={facilityCancelReservation}>
                  <input type="hidden" name="facility_id" value={facilityId} />
                  <input type="hidden" name="id" value={r.id} />
                  <ConfirmSubmitButton
                    message={`${r.teacher_name} 선생님의 예약을 취소할까요?`}
                    className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
                  >
                    취소
                  </ConfirmSubmitButton>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
