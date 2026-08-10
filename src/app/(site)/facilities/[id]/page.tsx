import Link from "next/link";
import { notFound } from "next/navigation";
import { addDays, format } from "date-fns";
import { getFacility } from "@/lib/data/facilities";
import { getTimeSlots } from "@/lib/data/time-slots";
import { getReservationsForFacilityInRange } from "@/lib/data/reservations";
import { getSetting } from "@/lib/data/settings";
import { buildWeekDays, parseWeekParam, toISODate, formatWeekRangeLabel } from "@/lib/dates";
import { WeeklyTimetable } from "@/components/weekly-timetable";

export const dynamic = "force-dynamic";

export default async function FacilityDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ week?: string }>;
}) {
  const { id } = await params;
  const { week } = await searchParams;

  const facility = await getFacility(id);
  if (!facility) notFound();

  const weekendEnabledSetting = await getSetting("weekend_enabled", "false");
  const includeWeekend = weekendEnabledSetting === "true";

  const monday = parseWeekParam(week);
  const weekDays = buildWeekDays(monday, includeWeekend);
  const rangeStart = toISODate(monday);
  const rangeEnd = toISODate(weekDays[weekDays.length - 1].date);

  const [timeSlots, reservations] = await Promise.all([
    getTimeSlots(),
    getReservationsForFacilityInRange(id, rangeStart, rangeEnd),
  ]);

  const prevWeekIso = toISODate(addDays(monday, -7));
  const nextWeekIso = toISODate(addDays(monday, 7));
  const thisWeekIso = toISODate(new Date());

  return (
    <div>
      <Link href="/facilities" className="text-sm font-medium text-blue-600 hover:underline">
        ← 시설 목록
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
            style={{ backgroundColor: `${facility.color}1a` }}
          >
            {facility.icon}
          </span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{facility.name}</h1>
            <p className="text-sm text-slate-500">
              {facility.category}
              {facility.location ? ` · ${facility.location}` : ""}
              {facility.capacity ? ` · 수용인원 ${facility.capacity}명` : ""}
            </p>
          </div>
        </div>
      </div>

      {facility.description && (
        <p className="mt-4 rounded-2xl bg-white p-4 text-sm text-slate-600 border border-slate-200">
          {facility.description}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">주간 예약 시간표</h2>
        <div className="flex items-center gap-2">
          <Link
            href={`/facilities/${id}?week=${prevWeekIso}`}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            ← 이전 주
          </Link>
          <Link
            href={`/facilities/${id}?week=${thisWeekIso}`}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            이번 주
          </Link>
          <Link
            href={`/facilities/${id}?week=${nextWeekIso}`}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            다음 주 →
          </Link>
        </div>
      </div>
      <p className="mt-1 text-sm text-slate-400">{formatWeekRangeLabel(monday, weekDays)}</p>

      {timeSlots.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
          운영 중인 교시가 없습니다. 관리자 페이지에서 시간표를 설정해 주세요.
        </p>
      ) : (
        <div className="mt-4">
          <WeeklyTimetable
            facilityId={facility.id}
            facilityName={facility.name}
            timeSlots={timeSlots.map((t) => ({
              id: t.id,
              label: t.label,
              start_time: t.start_time.slice(0, 5),
              end_time: t.end_time.slice(0, 5),
            }))}
            weekDays={weekDays.map((d) => ({
              iso: d.iso,
              label: d.label,
              monthDay: format(d.date, "M/d"),
              isToday: d.isToday,
              isPast: d.isPast,
            }))}
            reservations={reservations.map((r) => ({
              id: r.id,
              reservation_date: r.reservation_date,
              time_slot_id: r.time_slot_id,
              teacher_name: r.teacher_name,
              department: r.department,
              purpose: r.purpose,
            }))}
          />
        </div>
      )}
    </div>
  );
}
