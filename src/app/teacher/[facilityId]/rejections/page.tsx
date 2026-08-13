import { notFound } from "next/navigation";
import { getFacility } from "@/lib/data/facilities";
import { getRecentRejectionsForFacility } from "@/lib/data/reservations";
import { TeacherPageHeader } from "@/components/teacher/teacher-page-header";
import { RejectReasonList } from "@/components/teacher/reject-reason-list";

export const dynamic = "force-dynamic";

export default async function TeacherRejectionsPage({
  params,
}: {
  params: Promise<{ facilityId: string }>;
}) {
  const { facilityId } = await params;
  const facility = await getFacility(facilityId);
  if (!facility) notFound();

  const rejections = await getRecentRejectionsForFacility(facilityId);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
      <TeacherPageHeader
        facility={facility}
        facilityId={facilityId}
        title="반려 내역"
        description="반려 사유는 기본적으로 예약 페이지에 공개됩니다. 공개하고 싶지 않은 사유는 비공개로 전환하세요."
      />

      <div className="mt-6">
        <RejectReasonList facilityId={facilityId} rejections={rejections} />
      </div>
    </div>
  );
}
