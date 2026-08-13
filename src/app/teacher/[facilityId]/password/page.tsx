import { notFound } from "next/navigation";
import { getFacility } from "@/lib/data/facilities";
import { TeacherPageHeader } from "@/components/teacher/teacher-page-header";
import { ChangePasswordForm } from "@/components/teacher/change-password-form";

export const dynamic = "force-dynamic";

export default async function TeacherPasswordPage({
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
        title="비밀번호 변경"
        description="이 시설의 로그인 비밀번호를 변경합니다."
      />

      <div className="mt-6">
        <ChangePasswordForm facilityId={facilityId} />
      </div>
    </div>
  );
}
