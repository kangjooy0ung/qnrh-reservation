import { notFound } from "next/navigation";
import { getFacility } from "@/lib/data/facilities";
import { getPendingReservationsForFacility } from "@/lib/data/reservations";
import { TeacherPageHeader } from "@/components/teacher/teacher-page-header";
import { PendingApplicantGroup } from "@/components/teacher/pending-applicant-group";
import type { ReservationWithRelations } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TeacherPendingPage({
  params,
}: {
  params: Promise<{ facilityId: string }>;
}) {
  const { facilityId } = await params;
  const facility = await getFacility(facilityId);
  if (!facility) notFound();

  const pending = facility.requires_approval
    ? await getPendingReservationsForFacility(facilityId)
    : [];

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
    <div>
      <TeacherPageHeader
        title="승인 대기 신청"
        description="같은 시간대에 여러 명이 신청할 수 있습니다. 1건만 승인하면 나머지는 자동 반려됩니다."
      />

      {!facility.requires_approval ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
          이 시설은 승인 절차가 없는 시설입니다.
        </p>
      ) : pendingGroups.size === 0 ? (
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
  );
}
