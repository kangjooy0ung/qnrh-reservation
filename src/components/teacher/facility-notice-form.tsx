"use client";

import { useActionState } from "react";
import { updateFacilityNotice } from "@/app/actions/teacher-actions";
import { initialActionState } from "@/lib/action-state";

export function FacilityNoticeForm({
  facilityId,
  initialNotice,
}: {
  facilityId: string;
  initialNotice: string | null;
}) {
  const [state, formAction, isPending] = useActionState(updateFacilityNotice, initialActionState);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4"
    >
      <input type="hidden" name="facility_id" value={facilityId} />
      <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
        시설 예약 페이지 상단에 표시할 공지 메모 (비워두면 표시되지 않습니다)
        <textarea
          name="notice"
          rows={3}
          maxLength={300}
          defaultValue={initialNotice ?? ""}
          placeholder="예: 이번 주 금요일은 도서관 소독으로 휴관합니다"
          className="input"
        />
      </label>

      {state.status === "error" && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.message}</p>
      )}
      {state.status === "success" && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {isPending ? "저장 중..." : "공지 메모 저장"}
      </button>
    </form>
  );
}
