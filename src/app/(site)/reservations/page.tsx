import { getReservationsByTeacherName } from "@/lib/data/reservations";
import { CancelReservationInline } from "@/components/cancel-reservation-inline";

export const dynamic = "force-dynamic";

export default async function MyReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const { name } = await searchParams;
  const query = name?.trim() ?? "";
  const reservations = query ? await getReservationsByTeacherName(query) : [];
  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">내 예약 확인</h1>
      <p className="mt-1 text-sm text-slate-500">
        예약 시 입력한 성함으로 검색하면 내 예약 내역을 확인하고 취소할 수 있습니다.
      </p>

      <form className="mt-6 flex max-w-md gap-2">
        <input
          type="text"
          name="name"
          defaultValue={query}
          required
          placeholder="예약자 성함을 입력하세요"
          className="input"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          검색
        </button>
      </form>

      <div className="mt-8">
        {!query && (
          <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
            성함을 입력하고 검색해 주세요.
          </p>
        )}

        {query && reservations.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
            &apos;{query}&apos;(으)로 예약된 내역이 없습니다.
          </p>
        )}

        {query && reservations.length > 0 && (
          <ul className="flex flex-col gap-3">
            {reservations.map((r) => {
              const canCancel =
                (r.status === "confirmed" || r.status === "pending") && r.reservation_date >= todayIso;
              return (
                <li
                  key={r.id}
                  className={`flex items-center justify-between gap-4 rounded-2xl border p-4 ${
                    r.status === "cancelled"
                      ? "border-slate-100 bg-slate-50 opacity-60"
                      : r.status === "pending"
                        ? "border-amber-200 bg-amber-50/40"
                        : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{r.facility?.icon ?? "🏫"}</span>
                      <p className="font-semibold text-slate-900">{r.facility?.name ?? "삭제된 시설"}</p>
                      {r.status === "cancelled" && (
                        <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">
                          {r.reject_reason ? "반려됨" : "취소됨"}
                        </span>
                      )}
                      {r.status === "pending" && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-700">
                          승인대기
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {r.reservation_date} · {r.time_slot?.label ?? "-"} (
                      {r.time_slot?.start_time.slice(0, 5)}~{r.time_slot?.end_time.slice(0, 5)})
                    </p>
                    {r.purpose && <p className="mt-0.5 text-xs text-slate-400">{r.purpose}</p>}
                    {r.status === "cancelled" && r.reject_reason && (
                      <p className="mt-0.5 text-xs text-red-500">반려 사유: {r.reject_reason}</p>
                    )}
                  </div>
                  {canCancel && <CancelReservationInline id={r.id} teacherName={r.teacher_name} />}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
