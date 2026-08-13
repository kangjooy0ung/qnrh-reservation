import { setRejectReasonVisibility } from "@/app/actions/teacher-actions";
import type { ReservationWithRelations } from "@/lib/types";

export function RejectReasonList({
  facilityId,
  rejections,
}: {
  facilityId: string;
  rejections: ReservationWithRelations[];
}) {
  if (rejections.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
        반려 내역이 없습니다.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {rejections.map((r) => (
        <li
          key={r.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm"
        >
          <div className="min-w-0">
            <p className="font-medium text-slate-800">
              {r.reservation_date} · {r.time_slot?.label ?? "-"} · {r.teacher_name}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">사유: {r.reject_reason}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              {r.reject_reason_public ? "🌐 예약 페이지에 공개 중" : "🔒 비공개 (예약 페이지에 표시 안 됨)"}
            </p>
          </div>
          <form action={setRejectReasonVisibility}>
            <input type="hidden" name="facility_id" value={facilityId} />
            <input type="hidden" name="id" value={r.id} />
            <input type="hidden" name="public" value={r.reject_reason_public ? "false" : "true"} />
            <button
              type="submit"
              className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              {r.reject_reason_public ? "비공개로 전환" : "다시 공개"}
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}
