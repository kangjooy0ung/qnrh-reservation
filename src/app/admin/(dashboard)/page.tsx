import Link from "next/link";
import { addDays, format } from "date-fns";
import { getFacilities } from "@/lib/data/facilities";
import { getAllReservations, getTodayReservationCount } from "@/lib/data/reservations";
import { toISODate } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const today = new Date();
  const todayIso = toISODate(today);
  const weekLaterIso = toISODate(addDays(today, 7));

  const [facilities, todayCount, upcoming] = await Promise.all([
    getFacilities({ includeInactive: true }),
    getTodayReservationCount(todayIso),
    getAllReservations({ from: todayIso, to: weekLaterIso, status: "confirmed" }),
  ]);

  const activeFacilities = facilities.filter((f) => f.is_active).length;

  const stats = [
    { label: "오늘 예약", value: todayCount, unit: "건" },
    { label: "향후 7일 예약", value: upcoming.length, unit: "건" },
    { label: "운영 중인 시설", value: activeFacilities, unit: `/ ${facilities.length}개` },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">대시보드</h1>
      <p className="mt-1 text-sm text-slate-500">{format(today, "yyyy년 M월 d일")} 기준 현황입니다.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium text-slate-400">{s.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {s.value}
              <span className="ml-1 text-sm font-medium text-slate-400">{s.unit}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">다가오는 예약 (7일 이내)</h2>
        <Link href="/admin/reservations" className="text-sm font-medium text-blue-600 hover:underline">
          전체 예약 관리 →
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
              <th className="px-4 py-3 font-medium">날짜</th>
              <th className="px-4 py-3 font-medium">교시</th>
              <th className="px-4 py-3 font-medium">시설</th>
              <th className="px-4 py-3 font-medium">예약자</th>
              <th className="px-4 py-3 font-medium">목적</th>
            </tr>
          </thead>
          <tbody>
            {upcoming.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  향후 7일간 예약이 없습니다.
                </td>
              </tr>
            ) : (
              upcoming
                .slice()
                .sort((a, b) => a.reservation_date.localeCompare(b.reservation_date))
                .slice(0, 15)
                .map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3 text-slate-700">{r.reservation_date}</td>
                    <td className="px-4 py-3 text-slate-500">{r.time_slot?.label ?? "-"}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {r.facility?.icon} {r.facility?.name ?? "삭제된 시설"}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{r.teacher_name}</td>
                    <td className="px-4 py-3 text-slate-400">{r.purpose ?? "-"}</td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
