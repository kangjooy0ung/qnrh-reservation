import { notFound } from "next/navigation";
import { getFacility } from "@/lib/data/facilities";
import { getTimeSlotsForFacility } from "@/lib/data/time-slots";
import { TeacherPageHeader } from "@/components/teacher/teacher-page-header";
import { FacilityTimeSlotManager } from "@/components/teacher/facility-time-slot-manager";

export const dynamic = "force-dynamic";

export default async function TeacherTimeSlotsPage({
  params,
}: {
  params: Promise<{ facilityId: string }>;
}) {
  const { facilityId } = await params;
  const facility = await getFacility(facilityId);
  if (!facility) notFound();

  const timeSlots = facility.requires_approval
    ? await getTimeSlotsForFacility(facility, { includeInactive: true })
    : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
      <TeacherPageHeader
        facility={facility}
        facilityId={facilityId}
        title="교시 관리"
        description="이 시설만의 전용 시간대입니다. 추가/수정/삭제하면 예약 페이지에 바로 반영됩니다."
      />

      {!facility.requires_approval ? (
        <p className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
          이 시설은 전용 교시 대신 총관리자가 관리하는 공용 교시표를 사용합니다.
        </p>
      ) : (
        <div className="mt-6">
          <FacilityTimeSlotManager facilityId={facilityId} timeSlots={timeSlots} />
        </div>
      )}
    </div>
  );
}
