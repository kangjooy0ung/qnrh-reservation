"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteNotice, deleteNotices } from "@/app/actions/admin-actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { BulkActionBar } from "@/components/admin/bulk-action-bar";
import type { Notice } from "@/lib/types";

export function NoticesList({ notices }: { notices: Notice[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allIds = notices.map((n) => n.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(allIds));
  }

  return (
    <>
      <BulkActionBar
        count={selected.size}
        onClear={() => setSelected(new Set())}
        actionLabel="선택 공지 삭제"
        confirmMessage={`선택한 ${selected.size}개 공지사항을 삭제할까요?`}
        onConfirm={async () => {
          await deleteNotices(Array.from(selected));
          setSelected(new Set());
        }}
      />

      <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
        {notices.length === 0 ? (
          <p className="px-4 py-8 text-center text-slate-400">등록된 공지사항이 없습니다.</p>
        ) : (
          <>
            <label className="flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-slate-400">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="h-4 w-4 rounded border-slate-300"
              />
              전체 선택
            </label>
            {notices.map((n) => (
              <div key={n.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selected.has(n.id)}
                    onChange={() => toggle(n.id)}
                    className="h-4 w-4 shrink-0 rounded border-slate-300"
                    aria-label={`${n.title} 선택`}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {n.is_pinned && (
                        <span className="rounded bg-red-50 px-1.5 py-0.5 text-xs font-semibold text-red-600">
                          고정
                        </span>
                      )}
                      <p className="truncate font-medium text-slate-800">{n.title}</p>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {new Date(n.created_at).toLocaleString("ko-KR")}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link
                    href={`/admin/notices/${n.id}`}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    수정
                  </Link>
                  <form action={deleteNotice}>
                    <input type="hidden" name="id" value={n.id} />
                    <ConfirmSubmitButton
                      message={`'${n.title}' 공지사항을 삭제할까요?`}
                      className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
                    >
                      삭제
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}
