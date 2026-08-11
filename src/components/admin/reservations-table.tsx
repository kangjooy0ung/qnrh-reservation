"use client";

import { useState } from "react";
import { adminCancelReservation, adminBulkCancelReservations } from "@/app/actions/admin-actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { BulkActionBar } from "@/components/admin/bulk-action-bar";
import type { ReservationWithRelations } from "@/lib/types";

export function ReservationsTable({
  reservations,
}: {
  reservations: ReservationWithRelations[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const cancellableIds = reservations
    .filter((r) => r.status === "confirmed" || r.status === "pending")
    .map((r) => r.id);
  const allSelected = cancellableIds.length > 0 && cancellableIds.every((id) => selected.has(id));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(cancellableIds));
  }

  return (
    <>
      <BulkActionBar
        count={selected.size}
        onClear={() => setSelected(new Set())}
        actionLabel="선택 예약 취소"
        confirmMessage={`선택한 ${selected.size}건의 예약을 취소할까요?`}
        onConfirm={async () => {
          await adminBulkCancelReservations(Array.from(selected));
          setSelected(new Set());
        }}
      />

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  disabled={cancellableIds.length === 0}
                  className="h-4 w-4 rounded border-slate-300"
                  aria-label="전체 선택"
                />
              </th>
              <th className="px-4 py-3 font-medium">날짜</th>
              <th className="px-4 py-3 font-medium">교시</th>
              <th className="px-4 py-3 font-medium">시설</th>
              <th className="px-4 py-3 font-medium">예약자</th>
              <th className="px-4 py-3 font-medium">학년/부서</th>
              <th className="px-4 py-3 font-medium">목적</th>
              <th className="px-4 py-3 font-medium">연락처</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium text-right">관리</th>
            </tr>
          </thead>
          <tbody>
            {reservations.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-slate-400">
                  조건에 맞는 예약이 없습니다.
                </td>
              </tr>
            ) : (
              reservations.map((r) => (
                <tr key={r.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3">
                    {(r.status === "confirmed" || r.status === "pending") && (
                      <input
                        type="checkbox"
                        checked={selected.has(r.id)}
                        onChange={() => toggle(r.id)}
                        className="h-4 w-4 rounded border-slate-300"
                        aria-label={`${r.teacher_name} 예약 선택`}
                      />
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{r.reservation_date}</td>
                  <td className="px-4 py-3 text-slate-500">{r.time_slot?.label ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {r.facility?.icon} {r.facility?.name ?? "삭제된 시설"}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">{r.teacher_name}</td>
                  <td className="px-4 py-3 text-slate-500">{r.department ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-500">{r.purpose ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-500">{r.contact ?? "-"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                        r.status === "confirmed"
                          ? "bg-emerald-50 text-emerald-600"
                          : r.status === "pending"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {r.status === "confirmed" ? "예약중" : r.status === "pending" ? "승인대기" : "취소됨"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {(r.status === "confirmed" || r.status === "pending") && (
                      <form action={adminCancelReservation}>
                        <input type="hidden" name="id" value={r.id} />
                        <ConfirmSubmitButton
                          message={`${r.teacher_name} 선생님의 예약을 취소할까요?`}
                          className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
                        >
                          취소
                        </ConfirmSubmitButton>
                      </form>
                    )}
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
