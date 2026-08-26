import { notFound } from "next/navigation";
import { getFacility } from "@/lib/data/facilities";
import { getAllReservations, getPendingReservationsForFacility } from "@/lib/data/reservations";
import { TeacherPageHeader } from "@/components/teacher/teacher-page-header";
import { PendingApprovalBoard } from "@/components/teacher/pending-approval-board";
import { FacilityReservationList } from "@/components/teacher/facility-reservation-list";
import type { ReservationWithRelations } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TeacherFacilityHomePage({
  params,
}: {
  params: Promise<{ facilityId: string }>;
}) {
  const { facilityId } = await params;
  const facility = await getFacility(facilityId);
  if (!facility) notFound();

  const [pending, confirmed] = await Promise.all([
    facility.requires_approval ? getPendingReservationsForFacility(facilityId) : Promise.resolve([]),
    getAllReservations({ facilityId, status: "confirmed" }),
  ]);

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
        title={`${facility.icon} ${facility.name} 담당 선생님`}
        description="자주 확인하는 승인 대기와 예약 현황을 바로 볼 수 있습니다. 나머지 기능은 왼쪽(모바일은 상단) 메뉴에서 이동하세요."
      />

      {facility.requires_approval && (
        <section>
          <h2 className="text-lg font-bold text-slate-900">승인 대기 신청</h2>
          <div className="mt-3">
            {pendingGroups.size === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
                승인 대기 중인 신청이 없습니다.
              </p>
            ) : (
              <PendingApprovalBoard facilityId={facilityId} groups={Array.from(pendingGroups.values())} />
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
    </div>
  );
}
