import { notFound } from "next/navigation";
import { getFacility } from "@/lib/data/facilities";
import { getTimeSlotsForFacility } from "@/lib/data/time-slots";
import {
  getAllReservations,
  getFacilityUsageStats,
  getPendingReservationsForFacility,
} from "@/lib/data/reservations";
import { teacherLogout } from "@/app/actions/teacher-actions";
import { PendingApplicantGroup } from "@/components/teacher/pending-applicant-group";
import { FacilityReservationList } from "@/components/teacher/facility-reservation-list";
import { FacilityTimeSlotManager } from "@/components/teacher/facility-time-slot-manager";
import { BlockSlotForm } from "@/components/teacher/block-slot-form";
import { FacilityUsageStatsView } from "@/components/teacher/facility-usage-stats";
import { ChangePasswordForm } from "@/components/teacher/change-password-form";
import { FacilityNoticeForm } from "@/components/teacher/facility-notice-form";
import type { ReservationWithRelations } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TeacherFacilityDashboardPage({
  params,
}: {
  params: Promise<{ facilityId: string }>;
}) {
  const { facilityId } = await params;
  const facility = await getFacility(facilityId);
  if (!facility) notFound();

  const [pending, allReservations, timeSlots, stats] = await Promise.all([
    getPendingReservationsForFacility(facilityId),
    getAllReservations({ facilityId, status: "all" }),
    getTimeSlotsForFacility(facility, { includeInactive: true }),
    getFacilityUsageStats(facilityId),
  ]);

  const confirmed = allReservations.filter((r) => r.status === "confirmed");
  const blocked = allReservations.filter((r) => r.status === "blocked");
  const activeTimeSlots = timeSlots.filter((t) => t.is_active);

  const pendingGroups = new Map<
    string,
    { reservationDate: string; timeSlot: ReservationWithRelations["time_slot"]; applicants: ReservationWithRelations[] }
  >();
  for (const r of pending) {
    const key = `${r.reservation_date}__${r.time_slot_id}`;
    const group = pendingGroups.get(key);
    if (group) group.applicants.push(r);
    else pendingGroups.set(key, { reservationDate: r.reservation_date, timeSlot: r.time_slot, applicants: [r] });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {facility.icon} {facility.name} 담당 선생님
          </h1>
          <p className="mt-1 text-sm text-slate-500">예약 승인, 시간대 관리를 할 수 있습니다.</p>
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

      <section className="mt-8">
        <h2 className="text-lg font-bold text-slate-900">시설 공지 메모</h2>
        <p className="mt-1 text-sm text-slate-500">
          여기에 남긴 메모는 이 시설의 예약 페이지 상단에 그대로 표시됩니다.
        </p>
        <div className="mt-3">
          <FacilityNoticeForm facilityId={facilityId} initialNotice={facility.teacher_notice} />
        </div>
      </section>

      {facility.requires_approval && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-slate-900">승인 대기 신청</h2>
          <div className="mt-3">
            {pendingGroups.size === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
                승인 대기 중인 신청이 없습니다.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {Array.from(pendingGroups.values()).map((group) => (
                  <PendingApplicantGroup
                    key={`${group.reservationDate}__${group.timeSlot?.id}`}
                    facilityId={facilityId}
                    reservationDate={group.reservationDate}
                    timeSlotLabel={group.timeSlot?.label ?? "-"}
                    timeSlotRange={
                      group.timeSlot
                        ? `${group.timeSlot.start_time.slice(0, 5)}~${group.timeSlot.end_time.slice(0, 5)}`
                        : ""
                    }
                    applicants={group.applicants}
                  />
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-bold text-slate-900">예약 현황</h2>
        <div className="mt-3">
          <FacilityReservationList facilityId={facilityId} reservations={confirmed} />
        </div>
      </section>

      {facility.requires_approval && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-slate-900">교시 관리</h2>
          <p className="mt-1 text-sm text-slate-500">
            이 시설만의 전용 시간대입니다. 추가/수정/삭제하면 예약 페이지에 바로 반영됩니다.
          </p>
          <div className="mt-3">
            <FacilityTimeSlotManager facilityId={facilityId} timeSlots={timeSlots} />
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-bold text-slate-900">시간대 사용 제한</h2>
        <p className="mt-1 text-sm text-slate-500">
          담당 선생님이 직접 써야 하는 시간대를 막아 다른 사람이 예약하지 못하도록 합니다.
        </p>
        <div className="mt-3">
          <BlockSlotForm facilityId={facilityId} timeSlots={activeTimeSlots} blockedReservations={blocked} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-slate-900">누적 대여시간</h2>
        <div className="mt-3">
          <FacilityUsageStatsView stats={stats} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-slate-900">비밀번호 변경</h2>
        <div className="mt-3">
          <ChangePasswordForm facilityId={facilityId} />
        </div>
      </section>
    </div>
  );
}
