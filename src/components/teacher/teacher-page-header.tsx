import Link from "next/link";
import { teacherLogout } from "@/app/actions/teacher-actions";
import type { Facility } from "@/lib/types";

export function TeacherPageHeader({
  facility,
  facilityId,
  title,
  description,
  showBack = true,
}: {
  facility: Facility;
  facilityId: string;
  title: string;
  description?: string;
  showBack?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        {showBack && (
          <Link
            href={`/teacher/${facilityId}`}
            className="text-sm font-medium text-emerald-600 hover:underline"
          >
            ← {facility.icon} {facility.name} 대시보드
          </Link>
        )}
        <h1 className={`text-2xl font-bold text-slate-900 ${showBack ? "mt-2" : ""}`}>{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      <form action={teacherLogout}>
        <button
          type="submit"
          className="shrink-0 rounded-lg px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50"
        >
          로그아웃
        </button>
      </form>
    </div>
  );
}
