import { notFound } from "next/navigation";
import { getFacility } from "@/lib/data/facilities";
import { getFacilityUsageStats } from "@/lib/data/reservations";
import { TeacherPageHeader } from "@/components/teacher/teacher-page-header";
import { FacilityUsageStatsView } from "@/components/teacher/facility-usage-stats";

export const dynamic = "force-dynamic";

export default async function TeacherStatsPage({
  params,
}: {
  params: Promise<{ facilityId: string }>;
}) {
  const { facilityId } = await params;
  const facility = await getFacility(facilityId);
  if (!facility) notFound();

  const stats = await getFacilityUsageStats(facilityId);

  return (
    <div>
      <TeacherPageHeader
        title="누적 대여시간"
        description="확정된 예약 기준으로 학기·월별 누적 사용시간을 보여줍니다."
      />
      <FacilityUsageStatsView stats={stats} />
    </div>
  );
}
