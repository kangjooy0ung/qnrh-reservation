import { notFound } from "next/navigation";
import { getFacility } from "@/lib/data/facilities";
import { getFacilityUsageStats, getFacilityUsageStatsForRange } from "@/lib/data/reservations";
import { isValidISODate } from "@/lib/dates";
import { TeacherPageHeader } from "@/components/teacher/teacher-page-header";
import { FacilityUsageStatsView } from "@/components/teacher/facility-usage-stats";
import { FacilityUsageRangeView } from "@/components/teacher/facility-usage-range-view";

export const dynamic = "force-dynamic";

export default async function TeacherStatsPage({
  params,
  searchParams,
}: {
  params: Promise<{ facilityId: string }>;
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { facilityId } = await params;
  const { from, to } = await searchParams;
  const facility = await getFacility(facilityId);
  if (!facility) notFound();

  const stats = await getFacilityUsageStats(facilityId);

  const rangeStats =
    isValidISODate(from) && isValidISODate(to) && from <= to
      ? await getFacilityUsageStatsForRange(facilityId, from, to)
      : null;
  const invalidRange = Boolean((from || to) && !rangeStats);

  return (
    <div>
      <TeacherPageHeader
        title="누적 대여시간"
        description="확정된 예약 기준으로 학기·월별 누적 사용시간을 보여줍니다."
      />
      <FacilityUsageStatsView stats={stats} />

      <div className="mt-6">
        <FacilityUsageRangeView from={from} to={to} stats={rangeStats} invalid={invalidRange} />
      </div>
    </div>
  );
}
