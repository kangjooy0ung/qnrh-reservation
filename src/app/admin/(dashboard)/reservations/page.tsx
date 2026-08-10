import { getAllReservations } from "@/lib/data/reservations";
import { getFacilities } from "@/lib/data/facilities";
import { adminCancelReservation } from "@/app/actions/admin-actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

export const dynamic = "force-dynamic";

export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ facility?: string; status?: string; from?: string; to?: string }>;
}) {
  const { facility, status, from, to } = await searchParams;
  const facilities = await getFacilities({ includeInactive: true });

  const reservations = await getAllReservations({
    facilityId: facility || undefined,
    status: (status as "confirmed" | "cancelled" | "all") || "confirmed",
    from: from || undefined,
    to: to || undefined,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">예약 관리</h1>
      <p className="mt-1 text-sm text-slate-500">전체 예약 내역을 조회하고 필요 시 취소합니다.</p>

      <form className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <Field label="시설">
          <select name="facility" defaultValue={facility ?? ""} className="input">
            <option value="">전체</option>
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="상태">
          <select name="status" defaultValue={status ?? "confirmed"} className="input">
            <option value="confirmed">예약중</option>
            <option value="cancelled">취소됨</option>
            <option value="all">전체</option>
          </select>
        </Field>
        <Field label="시작일">
          <input type="date" name="from" defaultValue={from ?? ""} className="input" />
        </Field>
        <Field label="종료일">
          <input type="date" name="to" defaultValue={to ?? ""} className="input" />
        </Field>
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          조회
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
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
                <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                  조건에 맞는 예약이 없습니다.
                </td>
              </tr>
            ) : (
              reservations.map((r) => (
                <tr key={r.id} className="border-b border-slate-50 last:border-0">
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
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {r.status === "confirmed" ? "예약중" : "취소됨"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.status === "confirmed" && (
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
    </div>
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
