import Link from "next/link";
import { getFacilities } from "@/lib/data/facilities";
import { FacilitiesTable } from "@/components/admin/facilities-table";

export const dynamic = "force-dynamic";

export default async function AdminFacilitiesPage() {
  const facilities = await getFacilities({ includeInactive: true });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">시설 관리</h1>
          <p className="mt-1 text-sm text-slate-500">예약 가능한 시설을 추가·수정·삭제합니다.</p>
        </div>
        <Link
          href="/admin/facilities/new"
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          + 새 시설 추가
        </Link>
      </div>

      <div className="mt-6">
        <FacilitiesTable facilities={facilities} />
      </div>
    </div>
  );
}
