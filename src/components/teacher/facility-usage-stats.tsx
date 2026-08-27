import type { FacilityUsageStats } from "@/lib/data/reservations";

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

export function FacilityUsageStatsView({ stats }: { stats: FacilityUsageStats }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold text-slate-800">{stats.yearLabel} 누적 대여시간</p>
        <p className="text-lg font-bold text-emerald-600">{formatMinutes(stats.yearMinutes)}</p>
      </div>

      {stats.monthly.length === 0 ? (
        <p className="mt-4 text-center text-xs text-slate-400">이번 학년도 확정 예약이 아직 없습니다.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {stats.monthly.map((m) => {
            const ratio = stats.yearMinutes > 0 ? (m.minutes / stats.yearMinutes) * 100 : 0;
            return (
              <li key={m.month} className="flex items-center gap-3 text-xs">
                <span className="w-14 shrink-0 text-slate-500">{m.month}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <span
                    className="block h-full rounded-full bg-emerald-400"
                    style={{ width: `${Math.max(ratio, 4)}%` }}
                  />
                </span>
                <span className="w-16 shrink-0 text-right font-medium text-slate-700">
                  {formatMinutes(m.minutes)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
