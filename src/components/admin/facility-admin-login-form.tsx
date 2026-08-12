"use client";

import { useActionState } from "react";
import { setFacilityAdminPassword } from "@/app/actions/admin-actions";
import { initialActionState } from "@/lib/action-state";
import { DEFAULT_FACILITY_PASSWORD } from "@/lib/facility-admin-auth";

export function FacilityAdminLoginForm({ facilityId }: { facilityId: string }) {
  const [state, formAction, isPending] = useActionState(setFacilityAdminPassword, initialActionState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="facility_id" value={facilityId} />
      <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
        새 비밀번호 (비워두면 기본값 &quot;{DEFAULT_FACILITY_PASSWORD}&quot;로 설정됩니다)
        <input
          name="new_password"
          placeholder={DEFAULT_FACILITY_PASSWORD}
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
        {isPending ? "저장 중..." : "로그인 설정/초기화"}
      </button>
    </form>
  );
}
