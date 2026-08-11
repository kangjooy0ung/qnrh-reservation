import Link from "next/link";
import { notFound } from "next/navigation";
import { getFacility } from "@/lib/data/facilities";
import { getTimeSlots } from "@/lib/data/time-slots";
import { getReservationsForFacilityInRange } from "@/lib/data/reservations";
import {
  buildMonthGrid,
  parseMonthParam,
  toMonthParam,
  formatMonthLabel,
  addMonths,
} from "@/lib/dates";

export const dynamic = "force-dynamic";

const WEEKDAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

export default async function FacilityCalendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ month?: string }>;
}) {
  const { id } = await params;
  const { month } = await searchParams;

  const monthStart = parseMonthParam(month);
  const days = buildMonthGrid(monthStart);

  const [facility, timeSlots, reservations] = await Promise.all([
    getFacility(id),
    getTimeSlots(),
    getReservationsForFacilityInRange(id, days[0].iso, days[days.length - 1].iso),
  ]);
  if (!facility) notFound();

  const countByDate = new Map<string, number>();
  for (const r of reservations) {
    countByDate.set(r.reservation_date, (countByDate.get(r.reservation_date) ?? 0) + 1);
  }

  const totalSlots = timeSlots.length;
  const prevMonthParam = toMonthParam(addMonths(monthStart, -1));
  const nextMonthParam = toMonthParam(addMonths(monthStart, 1));
  const thisMonthParam = toMonthParam(new Date());

  return (
    <div>
      <Link
        href={`/facilities/${id}`}
        className="text-sm font-medium text-emerald-600 hover:underline"
      >
        ← {facility.name} 주간 시간표
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="text-3xl leading-none" aria-hidden="true">
          {facility.icon}
        </span>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{facility.name}</h1>
          <p className="text-sm text-slate-500">월별 예약 현황</p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">{formatMonthLabel(monthStart)}</h2>
        <div className="flex items-center gap-2">
          <Link
            href={`/facilities/${id}/calendar?month=${prevMonthParam}`}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            ← 이전 달
          </Link>
          <Link
            href={`/facilities/${id}/calendar?month=${thisMonthParam}`}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            이번 달
          </Link>
          <Link
            href={`/facilities/${id}/calendar?month=${nextMonthParam}`}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            다음 달 →
          </Link>
        </div>
      </div>

      {totalSlots === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
          운영 중인 교시가 없습니다. 관리자 페이지에서 시간표를 설정해 주세요.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 sm:p-4">
          <div className="grid min-w-[560px] grid-cols-7 gap-px overflow-hidden rounded-xl bg-slate-100 text-center text-xs font-semibold text-slate-400">
            {WEEKDAY_LABELS.map((label) => (
              <div key={label} className="bg-slate-50 py-2">
                {label}
              </div>
            ))}
          </div>
          <div className="grid min-w-[560px] grid-cols-7 gap-px overflow-hidden rounded-xl bg-slate-100">
            {days.map((day) => {
              const count = countByDate.get(day.iso) ?? 0;
              const isFull = count > 0 && count >= totalSlots;
              return (
                <Link
                  key={day.iso}
                  href={`/facilities/${id}?week=${day.iso}`}
                  className={`flex min-h-[76px] flex-col gap-1 bg-white p-2 text-left transition hover:bg-emerald-50 ${
                    day.isCurrentMonth ? "" : "opacity-40"
                  }`}
                >
                  <span
                    className={`text-xs font-semibold ${
                      day.isToday ? "flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white" : "text-slate-500"
                    }`}
                  >
                    {day.date.getDate()}
                  </span>
                  {count > 0 && (
                    <span
                      className={`inline-block w-fit rounded px-1.5 py-0.5 text-[11px] font-medium ${
                        isFull ? "bg-emerald-100 text-emerald-700" : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {isFull ? "마감" : `예약 ${count}건`}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-emerald-50 border border-emerald-100" /> 일부 예약됨
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-emerald-100 border border-emerald-200" /> 전 교시 마감
        </span>
        <span>날짜를 클릭하면 해당 주간 시간표로 이동합니다.</span>
      </div>
    </div>
  );
}
