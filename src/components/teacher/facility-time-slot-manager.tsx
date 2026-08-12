"use client";

import { useActionState, useEffect, useState } from "react";
import { deleteFacilityTimeSlot, upsertFacilityTimeSlot } from "@/app/actions/teacher-actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { initialActionState } from "@/lib/action-state";
import type { TimeSlot } from "@/lib/types";

export function FacilityTimeSlotManager({
  facilityId,
  timeSlots,
}: {
  facilityId: string;
  timeSlots: TimeSlot[];
}) {
  const [editing, setEditing] = useState<TimeSlot | null | undefined>(undefined);

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
              <th className="px-4 py-3 font-medium">순서</th>
              <th className="px-4 py-3 font-medium">교시명</th>
              <th className="px-4 py-3 font-medium">시간</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium text-right">관리</th>
            </tr>
          </thead>
          <tbody>
            {timeSlots.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  등록된 교시가 없습니다.
                </td>
              </tr>
            ) : (
              timeSlots.map((t) => (
                <tr key={t.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 text-slate-400">{t.sort_order}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{t.label}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {t.start_time.slice(0, 5)}~{t.end_time.slice(0, 5)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                        t.is_active ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {t.is_active ? "노출" : "비노출"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing(t)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        수정
                      </button>
                      <form action={deleteFacilityTimeSlot}>
                        <input type="hidden" name="facility_id" value={facilityId} />
                        <input type="hidden" name="id" value={t.id} />
                        <ConfirmSubmitButton
                          message={`'${t.label}' 교시를 삭제할까요? 관련 예약이 있으면 삭제되지 않을 수 있습니다.`}
                          className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
                        >
                          삭제
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editing === undefined ? (
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="self-start rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          + 교시 추가
        </button>
      ) : (
        <TimeSlotEditForm
          facilityId={facilityId}
          timeSlot={editing ?? undefined}
          onDone={() => setEditing(undefined)}
        />
      )}
    </div>
  );
}

function TimeSlotEditForm({
  facilityId,
  timeSlot,
  onDone,
}: {
  facilityId: string;
  timeSlot?: TimeSlot;
  onDone: () => void;
}) {
  const [state, formAction, isPending] = useActionState(upsertFacilityTimeSlot, initialActionState);

  useEffect(() => {
    if (state.status === "success") {
      onDone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4"
    >
      <input type="hidden" name="facility_id" value={facilityId} />
      {timeSlot && <input type="hidden" name="id" value={timeSlot.id} />}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          교시명 *
          <input
            name="label"
            required
            maxLength={20}
            defaultValue={timeSlot?.label}
            className="input"
            placeholder="예: 1교시"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          정렬 순서
          <input
            type="number"
            name="sort_order"
            defaultValue={timeSlot?.sort_order ?? 0}
            className="input"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          시작 시간 *
          <input
            type="time"
            name="start_time"
            required
            defaultValue={timeSlot?.start_time?.slice(0, 5)}
            className="input"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          종료 시간 *
          <input
            type="time"
            name="end_time"
            required
            defaultValue={timeSlot?.end_time?.slice(0, 5)}
            className="input"
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={timeSlot?.is_active ?? true}
          className="h-4 w-4 rounded border-slate-300"
        />
        예약 시간표에 노출
      </label>

      {state.status === "error" && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.message}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {isPending ? "저장 중..." : "저장하기"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          취소
        </button>
      </div>
    </form>
  );
}
