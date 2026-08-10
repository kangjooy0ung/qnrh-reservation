import Link from "next/link";
import { getFacilities } from "@/lib/data/facilities";
import { deleteFacility } from "@/app/actions/admin-actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

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
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + 새 시설 추가
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
              <th className="px-4 py-3 font-medium">시설</th>
              <th className="px-4 py-3 font-medium">카테고리</th>
              <th className="px-4 py-3 font-medium">위치</th>
              <th className="px-4 py-3 font-medium">수용인원</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium text-right">관리</th>
            </tr>
          </thead>
          <tbody>
            {facilities.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  등록된 시설이 없습니다.
                </td>
              </tr>
            ) : (
              facilities.map((f) => (
                <tr key={f.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3">
                    <span className="mr-1.5">{f.icon}</span>
                    <span className="font-medium text-slate-800">{f.name}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{f.category}</td>
                  <td className="px-4 py-3 text-slate-500">{f.location ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-500">{f.capacity ?? "-"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                        f.is_active ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {f.is_active ? "운영중" : "비공개"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/facilities/${f.id}`}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        수정
                      </Link>
                      <form action={deleteFacility}>
                        <input type="hidden" name="id" value={f.id} />
                        <ConfirmSubmitButton
                          message={`'${f.name}' 시설을 삭제하면 관련된 모든 예약 기록도 함께 삭제됩니다. 계속할까요?`}
                          className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
                        >
                          삭제
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
