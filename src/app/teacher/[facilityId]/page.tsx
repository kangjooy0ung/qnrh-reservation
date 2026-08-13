import { notFound } from "next/navigation";
import { getFacility } from "@/lib/data/facilities";
import { getFacilityStatusCounts, getRecentRejectionsForFacility } from "@/lib/data/reservations";
import { TeacherPageHeader } from "@/components/teacher/teacher-page-header";
import { TeacherNavCard } from "@/components/teacher/teacher-nav-card";

export const dynamic = "force-dynamic";

export default async function TeacherFacilityHubPage({
  params,
}: {
  params: Promise<{ facilityId: string }>;
}) {
  const { facilityId } = await params;
  const facility = await getFacility(facilityId);
  if (!facility) notFound();

  const [counts, rejections] = await Promise.all([
    getFacilityStatusCounts(facilityId),
    getRecentRejectionsForFacility(facilityId),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
      <TeacherPageHeader
        facility={facility}
        facilityId={facilityId}
        title={`${facility.icon} ${facility.name} 담당 선생님`}
        description="아래 메뉴에서 원하는 기능으로 이동하세요."
        showBack={false}
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {facility.requires_approval && (
          <TeacherNavCard
            href={`/teacher/${facilityId}/pending`}
            icon="📋"
            title="승인 대기 신청"
            description="여러 명이 신청한 시간대 중 1건을 승인하세요."
            badge={counts.pending}
          />
        )}
        <TeacherNavCard
          href={`/teacher/${facilityId}/reservations`}
          icon="📅"
          title="예약 현황"
          description="확정된 예약을 조회하고 취소할 수 있습니다."
          badge={counts.confirmed}
        />
        {facility.requires_approval && (
          <TeacherNavCard
            href={`/teacher/${facilityId}/time-slots`}
            icon="🕐"
            title="교시 관리"
            description="이 시설만의 전용 시간대를 추가/수정/삭제합니다."
          />
        )}
        <TeacherNavCard
          href={`/teacher/${facilityId}/block`}
          icon="🚫"
          title="시간대 사용 제한"
          description="직접 써야 하는 시간대를 막아 예약을 차단합니다."
          badge={counts.blocked}
        />
        <TeacherNavCard
          href={`/teacher/${facilityId}/rejections`}
          icon="ℹ️"
          title="반려 내역"
          description="반려 사유를 예약 페이지에 공개할지 관리합니다."
          badge={rejections.length}
        />
        <TeacherNavCard
          href={`/teacher/${facilityId}/stats`}
          icon="📊"
          title="누적 대여시간"
          description="학기·월별 누적 사용시간을 확인합니다."
        />
        <TeacherNavCard
          href={`/teacher/${facilityId}/notice`}
          icon="📌"
          title="공지 메모"
          description="예약 페이지 상단에 표시할 공지를 작성합니다."
        />
        <TeacherNavCard
          href={`/teacher/${facilityId}/password`}
          icon="🔑"
          title="비밀번호 변경"
          description="로그인 비밀번호를 변경합니다."
        />
      </div>
    </div>
  );
}
