"use client";

import { useActionState } from "react";
import { cancelReservation } from "@/app/actions/reservation-actions";
import { initialActionState } from "@/lib/action-state";

export function CancelReservationInline({ id, teacherName }: { id: string; teacherName: string }) {
  const [state, formAction, isPending] = useActionState(cancelReservation, initialActionState);

  if (state.status === "success") {
    return <p className="text-xs font-medium text-slate-400">{state.message}</p>;
  }

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="teacher_name" value={teacherName} />
      <button
        type="submit"
        disabled={isPending}
        className="shrink-0 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
      >
        {isPending ? "취소 중..." : "예약 취소"}
      </button>
      {state.status === "error" && <p className="text-xs text-red-500">{state.message}</p>}
    </form>
  );
}
