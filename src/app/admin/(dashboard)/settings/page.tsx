import Link from "next/link";
import { getTimeSlots } from "@/lib/data/time-slots";
import { getAllSettings } from "@/lib/data/settings";
import { deleteTimeSlot, updateSetting } from "@/app/actions/admin-actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [timeSlots, settings] = await Promise.all([
    getTimeSlots({ includeInactive: true }),
    getAllSettings(),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">운영 설정</h1>
        <p className="mt-1 text-sm text-slate-500">교시(시간표)와 사이트 운영 방식을 설정합니다.</p>
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">교시 관리</h2>
          <Link
            href="/admin/settings/time-slots/new"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + 교시 추가
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                <th className="px-4 py-3 font-medium">순서</th>
                <th className="px-4 py-3 font-medium">교시명</th>
                <th className="px-4 py-3 font-medium">시간</th>
                <th className="px-4 py-3 font-medium">상태</th>
                <th className="px-4 py-3 font-medium text-right">관리</th>
              </tr>
            </thead>
            <tbody>
              {timeSlots.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    등록된 교시가 없습니다.
                  </td>
                </tr>
              ) : (
                timeSlots.map((t) => (
                  <tr key={t.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3 text-slate-400">{t.sort_order}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{t.label}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {t.start_time.slice(0, 5)}~{t.end_time.slice(0, 5)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                          t.is_active ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {t.is_active ? "노출" : "비노출"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/settings/time-slots/${t.id}`}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          수정
                        </Link>
                        <form action={deleteTimeSlot}>
                          <input type="hidden" name="id" value={t.id} />
                          <ConfirmSubmitButton
                            message={`'${t.label}' 교시를 삭제할까요? 관련 예약이 있으면 삭제되지 않을 수 있습니다.`}
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
      </section>

      <section>
        <h2 className="text-lg font-bold text-slate-900">사이트 운영 설정</h2>
        <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6">
          <form action={updateSetting} className="flex flex-wrap items-center justify-between gap-3">
            <input type="hidden" name="key" value="weekend_enabled" />
            <div>
              <p className="text-sm font-medium text-slate-800">주말(토·일) 예약 허용</p>
              <p className="text-xs text-slate-400">
                현재: {settings.weekend_enabled === "true" ? "허용" : "월~금만 허용"}
              </p>
            </div>
            <input
              type="hidden"
              name="value"
              value={settings.weekend_enabled === "true" ? "false" : "true"}
            />
            <button
              type="submit"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {settings.weekend_enabled === "true" ? "주말 예약 끄기" : "주말 예약 켜기"}
            </button>
          </form>

          <form action={updateSetting} className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
            <input type="hidden" name="key" value="site_name" />
            <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-slate-500">
              사이트 이름
              <input
                name="value"
                defaultValue={settings.site_name}
                className="input"
                maxLength={60}
              />
            </label>
            <button
              type="submit"
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              저장
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
