import Link from "next/link";
import { getFacilitiesWithLogin } from "@/lib/data/facility-admins";
import { TeacherLoginForm } from "@/components/teacher/teacher-login-form";

export const dynamic = "force-dynamic";

export default async function TeacherLoginPage() {
  const facilities = await getFacilitiesWithLogin();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-xl text-white">
            🧑‍🏫
          </span>
          <h1 className="mt-3 text-lg font-bold text-slate-900">담당 선생님 로그인</h1>
          <p className="mt-1 text-sm text-slate-400">시설을 선택하고 비밀번호를 입력하세요.</p>
        </div>

        {facilities.length === 0 ? (
          <p className="rounded-lg bg-slate-50 px-3 py-3 text-center text-sm text-slate-400">
            아직 로그인이 설정된 시설이 없습니다. 총관리자에게 문의해 주세요.
          </p>
        ) : (
          <TeacherLoginForm facilities={facilities} />
        )}

        <Link
          href="/"
          className="mt-6 block text-center text-xs font-medium text-slate-400 hover:text-slate-600"
        >
          ← 예약 페이지로 돌아가기
        </Link>
      </div>
    </div>
  );
}
