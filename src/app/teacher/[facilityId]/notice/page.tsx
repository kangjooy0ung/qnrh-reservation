import { notFound } from "next/navigation";
import { getFacility } from "@/lib/data/facilities";
import { TeacherPageHeader } from "@/components/teacher/teacher-page-header";
import { FacilityNoticeForm } from "@/components/teacher/facility-notice-form";

export const dynamic = "force-dynamic";

export default async function TeacherNoticePage({
  params,
}: {
  params: Promise<{ facilityId: string }>;
}) {
  const { facilityId } = await params;
  const facility = await getFacility(facilityId);
  if (!facility) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
      <TeacherPageHeader
        facility={facility}
        facilityId={facilityId}
        title="시설 공지 메모"
        description="여기에 남긴 메모는 이 시설의 예약 페이지 상단에 그대로 표시됩니다."
      />

      <div className="mt-6">
        <FacilityNoticeForm facilityId={facilityId} initialNotice={facility.teacher_notice} />
      </div>
    </div>
  );
}
