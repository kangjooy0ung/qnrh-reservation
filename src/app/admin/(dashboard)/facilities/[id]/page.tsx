import Link from "next/link";
import { notFound } from "next/navigation";
import { getFacility } from "@/lib/data/facilities";
import { getFacilityAdmin } from "@/lib/data/facility-admins";
import { FacilityForm } from "@/components/admin/facility-form";
import { FacilityAdminLoginForm } from "@/components/admin/facility-admin-login-form";

export const dynamic = "force-dynamic";

export default async function EditFacilityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [facility, facilityAdmin] = await Promise.all([getFacility(id), getFacilityAdmin(id)]);
  if (!facility) notFound();

  return (
    <div>
      <Link href="/admin/facilities" className="text-sm font-medium text-emerald-600 hover:underline">
        ← 시설 관리
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-slate-900">{facility.name} 수정</h1>

      <div className="mt-6 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6">
        <FacilityForm facility={facility} />
      </div>

      <div className="mt-8 max-w-2xl">
        <h2 className="text-lg font-bold text-slate-900">담당 선생님 로그인</h2>
        <p className="mt-1 text-sm text-slate-500">
          {facilityAdmin
            ? "로그인이 설정되어 있습니다. 새 비밀번호를 입력해 초기화할 수 있습니다."
            : "아직 로그인이 설정되지 않았습니다. 저장하면 담당 선생님이 로그인할 수 있습니다."}
        </p>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6">
          <FacilityAdminLoginForm facilityId={facility.id} />
        </div>
        {facilityAdmin && (
          <Link
            href={`/teacher/${facility.id}`}
            className="mt-3 inline-block text-sm font-medium text-emerald-600 hover:underline"
          >
            이 시설 담당 선생님 대시보드 열기 →
          </Link>
        )}
      </div>
    </div>
  );
}
