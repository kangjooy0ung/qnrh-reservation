"use client";

import { useTransition } from "react";

export function BulkActionBar({
  count,
  onClear,
  actionLabel,
  confirmMessage,
  onConfirm,
}: {
  count: number;
  onClear: () => void;
  actionLabel: string;
  confirmMessage: string;
  onConfirm: () => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  if (count === 0) return null;

  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5">
      <p className="text-sm font-medium text-red-600">{count}개 선택됨</p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-medium text-slate-500 hover:text-slate-700"
        >
          선택 해제
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (!confirm(confirmMessage)) return;
            startTransition(() => {
              onConfirm();
            });
          }}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
        >
          {isPending ? "처리 중..." : actionLabel}
        </button>
      </div>
    </div>
  );
}
