import { notFound } from "next/navigation";
import { getFacility } from "@/lib/data/facilities";
import { getAllReservations } from "@/lib/data/reservations";
import { TeacherPageHeader } from "@/components/teacher/teacher-page-header";
import { FacilityReservationList } from "@/components/teacher/facility-reservation-list";

export const dynamic = "force-dynamic";

export default async function TeacherReservationsPage({
  params,
}: {
  params: Promise<{ facilityId: string }>;
}) {
  const { facilityId } = await params;
  const facility = await getFacility(facilityId);
  if (!facility) notFound();

  const confirmed = await getAllReservations({ facilityId, status: "confirmed" });

  return (
    <div>
      <TeacherPageHeader
        title="예약 현황"
        description="확정된 예약을 조회하고 필요하면 취소할 수 있습니다."
      />
      <FacilityReservationList facilityId={facilityId} reservations={confirmed} />
    </div>
  );
}
