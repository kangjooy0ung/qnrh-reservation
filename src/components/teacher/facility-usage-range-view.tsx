import type { FacilityUsageRangeStats } from "@/lib/data/reservations";

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

export function FacilityUsageRangeView({
  from,
  to,
  stats,
  invalid,
}: {
  from?: string;
  to?: string;
  stats: FacilityUsageRangeStats | null;
  invalid: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-800">기간 지정 누적 대여시간</p>
      <p className="mt-1 text-xs text-slate-400">
        시작일과 종료일을 지정하면 그 기간(둘 다 포함)의 확정 예약 누적 시간을 볼 수 있습니다.
      </p>

      <form className="mt-3 flex flex-wrap items-end gap-3">
        <Field label="시작일">
          <input type="date" name="from" defaultValue={from ?? ""} required className="input" />
        </Field>
        <Field label="종료일">
          <input type="date" name="to" defaultValue={to ?? ""} required className="input" />
        </Field>
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          조회
        </button>
      </form>

      {invalid && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
          시작일과 종료일을 올바르게 입력해 주세요. 시작일은 종료일보다 앞서거나 같아야 합니다.
        </p>
      )}

      {stats && (
        <div className="mt-4">
          <div className="flex items-baseline justify-between">
            <p className="text-xs text-slate-500">
              {stats.start} ~ {stats.end}
            </p>
            <p className="text-lg font-bold text-emerald-600">{formatMinutes(stats.totalMinutes)}</p>
          </div>

          {stats.monthly.length === 0 ? (
            <p className="mt-4 text-center text-xs text-slate-400">해당 기간에 확정 예약이 없습니다.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-2">
              {stats.monthly.map((m) => {
                const ratio = stats.totalMinutes > 0 ? (m.minutes / stats.totalMinutes) * 100 : 0;
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
      )}
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
