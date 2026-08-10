"use client";

import { useActionState } from "react";
import { upsertTimeSlot } from "@/app/actions/admin-actions";
import { initialActionState } from "@/lib/action-state";
import type { TimeSlot } from "@/lib/types";

export function TimeSlotForm({ timeSlot }: { timeSlot?: TimeSlot }) {
  const [state, formAction, isPending] = useActionState(upsertTimeSlot, initialActionState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {timeSlot && <input type="hidden" name="id" value={timeSlot.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="교시명 *">
          <input
            name="label"
            required
            maxLength={20}
            defaultValue={timeSlot?.label}
            className="input"
            placeholder="예: 1교시"
          />
        </Field>
        <Field label="정렬 순서">
          <input
            type="number"
            name="sort_order"
            defaultValue={timeSlot?.sort_order ?? 0}
            className="input"
          />
        </Field>
        <Field label="시작 시간 *">
          <input
            type="time"
            name="start_time"
            required
            defaultValue={timeSlot?.start_time?.slice(0, 5)}
            className="input"
          />
        </Field>
        <Field label="종료 시간 *">
          <input
            type="time"
            name="end_time"
            required
            defaultValue={timeSlot?.end_time?.slice(0, 5)}
            className="input"
          />
        </Field>
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

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {isPending ? "저장 중..." : "저장하기"}
        </button>
      </div>
    </form>
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
