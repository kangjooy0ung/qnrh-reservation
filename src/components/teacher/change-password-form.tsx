"use client";

import { useActionState } from "react";
import { changeFacilityPassword } from "@/app/actions/teacher-actions";
import { initialActionState } from "@/lib/action-state";

export function ChangePasswordForm({ facilityId }: { facilityId: string }) {
  const [state, formAction, isPending] = useActionState(changeFacilityPassword, initialActionState);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:max-w-sm"
    >
      <input type="hidden" name="facility_id" value={facilityId} />
      <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
        새 비밀번호
        <input type="password" name="new_password" required minLength={4} className="input" />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
        새 비밀번호 확인
        <input type="password" name="confirm_password" required minLength={4} className="input" />
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
        {isPending ? "변경 중..." : "비밀번호 변경"}
      </button>
    </form>
  );
}
