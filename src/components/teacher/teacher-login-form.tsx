"use client";

import { useActionState } from "react";
import { teacherLogin } from "@/app/actions/teacher-actions";
import { initialActionState } from "@/lib/action-state";

export function TeacherLoginForm({
  facilities,
}: {
  facilities: { id: string; name: string; icon: string }[];
}) {
  const [state, formAction, isPending] = useActionState(teacherLogin, initialActionState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
        시설
        <select name="facility_id" required defaultValue="" className="input">
          <option value="" disabled>
            시설을 선택하세요
          </option>
          {facilities.map((f) => (
            <option key={f.id} value={f.id}>
              {f.icon} {f.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
        비밀번호
        <input
          type="password"
          name="password"
          required
          className="input"
          placeholder="비밀번호 입력"
        />
      </label>

      {state.status === "error" && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-xl bg-amber-500 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-60"
      >
        {isPending ? "확인 중..." : "로그인"}
      </button>
    </form>
  );
}
