"use client";

import Link from "next/link";
import { useActionState } from "react";
import { adminLogin } from "@/app/actions/admin-actions";
import { initialActionState } from "@/lib/action-state";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(adminLogin, initialActionState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-xl text-white">
            🔐
          </span>
          <h1 className="mt-3 text-lg font-bold text-slate-900">관리자 로그인</h1>
          <p className="mt-1 text-sm text-slate-400">시설·예약·공지사항을 관리합니다.</p>
        </div>

        <form action={formAction} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
            관리자 비밀번호
            <input
              type="password"
              name="password"
              required
              autoFocus
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
            className="mt-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {isPending ? "확인 중..." : "로그인"}
          </button>
        </form>

        <Link
          href="/"
          className="mt-6 block text-center text-xs font-medium text-slate-400 hover:text-slate-600"
        >
          ← 예약 페이지로 돌아가기
        </Link>
      </div>
    </div>
  );
}
