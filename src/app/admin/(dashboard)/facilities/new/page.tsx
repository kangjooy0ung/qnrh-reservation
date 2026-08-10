import Link from "next/link";
import { FacilityForm } from "@/components/admin/facility-form";

export default function NewFacilityPage() {
  return (
    <div>
      <Link href="/admin/facilities" className="text-sm font-medium text-emerald-600 hover:underline">
        ← 시설 관리
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-slate-900">새 시설 추가</h1>

      <div className="mt-6 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6">
        <FacilityForm />
      </div>
    </div>
  );
}
