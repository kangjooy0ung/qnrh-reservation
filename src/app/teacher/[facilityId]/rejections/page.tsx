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
    <div>
      <TeacherPageHeader
        title="반려 내역"
        description="반려 사유는 기본적으로 예약 페이지에 공개됩니다. 공개하고 싶지 않은 사유는 비공개로 전환하거나 완전히 삭제할 수 있습니다."
      />
      <RejectReasonList facilityId={facilityId} rejections={rejections} />
    </div>
  );
}
