"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteFacility, deleteFacilities } from "@/app/actions/admin-actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { BulkActionBar } from "@/components/admin/bulk-action-bar";
import type { Facility } from "@/lib/types";

export function FacilitiesTable({ facilities }: { facilities: Facility[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allIds = facilities.map((f) => f.id);
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
        actionLabel="선택 시설 삭제"
        confirmMessage={`선택한 ${selected.size}개 시설을 삭제하면 관련된 모든 예약 기록도 함께 삭제됩니다. 계속할까요?`}
        onConfirm={async () => {
          await deleteFacilities(Array.from(selected));
          setSelected(new Set());
        }}
      />

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  disabled={allIds.length === 0}
                  className="h-4 w-4 rounded border-slate-300"
                  aria-label="전체 선택"
                />
              </th>
              <th className="px-4 py-3 font-medium">시설</th>
              <th className="px-4 py-3 font-medium">카테고리</th>
              <th className="px-4 py-3 font-medium">위치</th>
              <th className="px-4 py-3 font-medium">수용인원</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium text-right">관리</th>
            </tr>
          </thead>
          <tbody>
            {facilities.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  등록된 시설이 없습니다.
                </td>
              </tr>
            ) : (
              facilities.map((f) => (
                <tr key={f.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(f.id)}
                      onChange={() => toggle(f.id)}
                      className="h-4 w-4 rounded border-slate-300"
                      aria-label={`${f.name} 선택`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="mr-1.5">{f.icon}</span>
                    <span className="font-medium text-slate-800">{f.name}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{f.category}</td>
                  <td className="px-4 py-3 text-slate-500">{f.location ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-500">{f.capacity ?? "-"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                        f.is_active ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {f.is_active ? "운영중" : "비공개"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/facilities/${f.id}`}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        수정
                      </Link>
                      <form action={deleteFacility}>
                        <input type="hidden" name="id" value={f.id} />
                        <ConfirmSubmitButton
                          message={`'${f.name}' 시설을 삭제하면 관련된 모든 예약 기록도 함께 삭제됩니다. 계속할까요?`}
                          className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
                        >
                          삭제
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
