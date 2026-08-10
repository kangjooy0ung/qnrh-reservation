import Link from "next/link";
import { notFound } from "next/navigation";
import { getFacility } from "@/lib/data/facilities";
import { FacilityForm } from "@/components/admin/facility-form";

export const dynamic = "force-dynamic";

export default async function EditFacilityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const facility = await getFacility(id);
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
    </div>
  );
}
