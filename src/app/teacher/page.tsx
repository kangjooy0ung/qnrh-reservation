import { getPendingReservations } from "@/lib/data/reservations";
import { teacherLogout } from "@/app/actions/teacher-actions";
import { PendingReservationCard } from "@/components/teacher/pending-reservation-card";

export const dynamic = "force-dynamic";

export default async function TeacherDashboardPage() {
  const reservations = await getPendingReservations();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">열린수업공간 예약 승인</h1>
          <p className="mt-1 text-sm text-slate-500">
            승인 대기 중인 예약 신청을 확인하고 승인 또는 반려할 수 있습니다.
          </p>
        </div>
        <form action={teacherLogout}>
          <button
            type="submit"
            className="shrink-0 rounded-lg px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50"
          >
            로그아웃
          </button>
        </form>
      </div>

      <div className="mt-6">
        {reservations.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
            승인 대기 중인 예약이 없습니다.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {reservations.map((r) => (
              <PendingReservationCard key={r.id} reservation={r} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
