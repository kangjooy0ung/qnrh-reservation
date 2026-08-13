import { notFound } from "next/navigation";
import { getFacility } from "@/lib/data/facilities";
import { getTimeSlotsForFacility } from "@/lib/data/time-slots";
import { getAllReservations } from "@/lib/data/reservations";
import { TeacherPageHeader } from "@/components/teacher/teacher-page-header";
import { BlockSlotForm } from "@/components/teacher/block-slot-form";

export const dynamic = "force-dynamic";

export default async function TeacherBlockPage({
  params,
}: {
  params: Promise<{ facilityId: string }>;
}) {
  const { facilityId } = await params;
  const facility = await getFacility(facilityId);
  if (!facility) notFound();

  const [timeSlots, blocked] = await Promise.all([
    getTimeSlotsForFacility(facility),
    getAllReservations({ facilityId, status: "blocked" }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
      <TeacherPageHeader
        facility={facility}
        facilityId={facilityId}
        title="시간대 사용 제한"
        description="담당 선생님이 직접 써야 하는 시간대를 막아 다른 사람이 예약하지 못하도록 합니다."
      />

      <div className="mt-6">
        <BlockSlotForm facilityId={facilityId} timeSlots={timeSlots} blockedReservations={blocked} />
      </div>
    </div>
  );
}
