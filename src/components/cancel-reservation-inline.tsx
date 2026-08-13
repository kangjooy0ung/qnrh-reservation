"use client";

import { useState } from "react";
import { useActionState } from "react";
import { cancelReservation } from "@/app/actions/reservation-actions";
import { initialActionState } from "@/lib/action-state";

export function CancelReservationInline({ id }: { id: string }) {
  const [state, formAction, isPending] = useActionState(cancelReservation, initialActionState);
  const [open, setOpen] = useState(false);

  if (state.status === "success") {
    return <p className="text-xs font-medium text-slate-400">{state.message}</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
      >
        예약 취소
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={id} />
      <div className="flex items-center gap-1.5">
        <input
          name="cancel_pin"
          required
          inputMode="numeric"
          pattern="\d{4}"
          maxLength={4}
          placeholder="취소 비밀번호 4자리"
          className="input w-32 text-xs"
        />
        <button
          type="submit"
          disabled={isPending}
          className="shrink-0 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
        >
          {isPending ? "취소 중..." : "확인"}
        </button>
      </div>
      {state.status === "error" && <p className="text-xs text-red-500">{state.message}</p>}
    </form>
  );
}
