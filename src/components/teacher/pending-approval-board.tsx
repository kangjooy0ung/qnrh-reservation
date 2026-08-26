"use client";

import { useState } from "react";
import { useActionState } from "react";
import { bulkApproveReservations } from "@/app/actions/teacher-actions";
import { initialActionState } from "@/lib/action-state";
import { PendingApplicantGroup } from "@/components/teacher/pending-applicant-group";
import type { ReservationWithRelations } from "@/lib/types";

export type PendingGroup = {
  reservationDate: string;
  timeSlot: ReservationWithRelations["time_slot"];
  applicants: ReservationWithRelations[];
};

export function PendingApprovalBoard({
  facilityId,
  groups,
}: {
  facilityId: string;
  groups: PendingGroup[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [state, formAction, isPending] = useActionState(bulkApproveReservations, initialActionState);

  // 일괄 승인 성공 시 렌더링 도중 선택 상태를 초기화합니다 (state 참조가 바뀔 때만 1회).
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state.status === "success" && selected.size > 0) setSelected(new Set());
  }

  const allIds = groups.flatMap((group) => group.applicants.map((a) => a.id));
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(allIds));
  }

  return (
    <div>
      <form
        action={formAction}
        className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
      >
        <input type="hidden" name="facility_id" value={facilityId} />
        {Array.from(selected).map((id) => (
          <input key={id} type="hidden" name="id" value={id} />
        ))}
        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="h-3.5 w-3.5"
          />
          전체 선택
        </label>
        <span className="text-xs text-slate-400">{selected.size}건 선택됨</span>
        <button
          type="submit"
          disabled={selected.size === 0 || isPending}
          onClick={(e) => {
            if (
              !confirm(
                `선택한 ${selected.size}건을 일괄 승인할까요? 같은 시간대에 다른 신청이 남아있다면 자동 반려됩니다.`
              )
            ) {
              e.preventDefault();
            }
          }}
          className="ml-auto rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending ? "승인 처리 중..." : "선택 항목 일괄 승인"}
        </button>
      </form>

      {state.status === "success" && (
        <p className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {state.message}
        </p>
      )}
      {state.status === "error" && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{state.message}</p>
      )}

      <ul className="flex flex-col gap-3">
        {groups.map((group) => (
          <PendingApplicantGroup
            key={`${group.reservationDate}__${group.timeSlot?.id}`}
            facilityId={facilityId}
            reservationDate={group.reservationDate}
            timeSlotLabel={group.timeSlot?.label ?? "-"}
            timeSlotRange={
              group.timeSlot
                ? `${group.timeSlot.start_time.slice(0, 5)}~${group.timeSlot.end_time.slice(0, 5)}`
                : ""
            }
            applicants={group.applicants}
            selectedIds={selected}
            onToggle={toggle}
          />
        ))}
      </ul>
    </div>
  );
}
