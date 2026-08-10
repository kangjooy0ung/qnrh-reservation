"use client";

import { useActionState } from "react";
import { upsertNotice } from "@/app/actions/admin-actions";
import { initialActionState } from "@/lib/action-state";
import type { Notice } from "@/lib/types";

export function NoticeForm({ notice }: { notice?: Notice }) {
  const [state, formAction, isPending] = useActionState(upsertNotice, initialActionState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {notice && <input type="hidden" name="id" value={notice.id} />}

      <Field label="제목 *">
        <input
          name="title"
          required
          maxLength={100}
          defaultValue={notice?.title}
          className="input"
          placeholder="공지 제목"
        />
      </Field>

      <Field label="내용 *">
        <textarea
          name="content"
          required
          rows={8}
          defaultValue={notice?.content}
          className="input"
          placeholder="공지 내용을 입력하세요"
        />
      </Field>

      <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
        <input
          type="checkbox"
          name="is_pinned"
          defaultChecked={notice?.is_pinned ?? false}
          className="h-4 w-4 rounded border-slate-300"
        />
        상단에 고정
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
