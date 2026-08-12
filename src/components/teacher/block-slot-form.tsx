"use client";

import { useActionState } from "react";
import { blockTimeSlot, unblockReservation } from "@/app/actions/teacher-actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { initialActionState } from "@/lib/action-state";
import type { ReservationWithRelations, TimeSlot } from "@/lib/types";

export function BlockSlotForm({
  facilityId,
  timeSlots,
  blockedReservations,
}: {
  facilityId: string;
  timeSlots: TimeSlot[];
  blockedReservations: ReservationWithRelations[];
}) {
  const [state, formAction, isPending] = useActionState(blockTimeSlot, initialActionState);

  return (
    <div className="flex flex-col gap-4">
      <form
        action={formAction}
        className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4"
      >
        <input type="hidden" name="facility_id" value={facilityId} />
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          날짜
          <input type="date" name="reservation_date" required className="input" />
        </label>

        <div>
          <p className="mb-1 text-xs font-medium text-slate-500">교시 (복수 선택 가능)</p>
          <div className="flex flex-wrap gap-2">
            {timeSlots.map((slot) => (
              <label
                key={slot.id}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600"
              >
                <input type="checkbox" name="time_slot_id" value={slot.id} className="h-3.5 w-3.5" />
                {slot.label}
              </label>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          사유 (선택)
          <input
            name="reason"
            maxLength={100}
            placeholder="예: 방과후 정기 수업 사용"
            className="input"
          />
        </label>

        {state.status === "error" && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.message}</p>
        )}
        {state.status === "success" && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="self-start rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {isPending ? "등록 중..." : "사용 제한 등록"}
        </button>
      </form>

      {blockedReservations.length > 0 && (
        <ul className="flex flex-col gap-2">
          {blockedReservations.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium text-slate-700">
                  {r.reservation_date} · {r.time_slot?.label ?? "-"}
                </p>
                {r.purpose && <p className="text-xs text-slate-400">{r.purpose}</p>}
              </div>
              <form action={unblockReservation}>
                <input type="hidden" name="facility_id" value={facilityId} />
                <input type="hidden" name="id" value={r.id} />
                <ConfirmSubmitButton
                  message="사용 제한을 해제할까요?"
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-white"
                >
                  해제
                </ConfirmSubmitButton>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
