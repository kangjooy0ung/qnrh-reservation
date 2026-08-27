import { notFound } from "next/navigation";
import { getFacility } from "@/lib/data/facilities";
import { getFacilityUsageStatsForRange } from "@/lib/data/reservations";
import { isValidISODate } from "@/lib/dates";
import { TeacherPageHeader } from "@/components/teacher/teacher-page-header";
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

  const rangeStats =
    isValidISODate(from) && isValidISODate(to) && from <= to
      ? await getFacilityUsageStatsForRange(facilityId, from, to)
      : null;
  const invalidRange = Boolean((from || to) && !rangeStats);

  return (
    <div>
      <TeacherPageHeader
        title="누적 대여시간"
        description="시작일과 종료일을 지정하면 그 기간의 확정 예약 누적 시간을 보여줍니다. 확정 예약 1건은 1시간으로 집계됩니다."
      />
      <FacilityUsageRangeView from={from} to={to} stats={rangeStats} invalid={invalidRange} />
    </div>
  );
}
